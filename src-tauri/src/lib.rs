use futures_util::StreamExt;
use serde::Serialize;
use std::env;
use std::fs;
use std::io;
use tauri::ipc::Channel;
use tokio::fs::create_dir_all;

#[tauri::command]
async fn unzip_file(file_name: String, download_path: String, repository_path: String) {
    let mut file_path = std::path::PathBuf::from(&download_path);
    file_path.push(file_name);
    println!("{:?} 233", file_path);
    let file = fs::File::open(file_path).unwrap();
    println!("{:?} 233", file);
    let mut archive = zip::ZipArchive::new(file).unwrap();
    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let mut outpath = std::path::PathBuf::from(&repository_path);
        if !outpath.exists() {
            create_dir_all(&outpath).await.unwrap();
        }
        match file.enclosed_name() {
            Some(p) => outpath.push(p),
            None => continue,
        }
        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {i} comment: {comment}");
            }
        }

        if file.is_dir() {
            println!("File {} extracted to \"{}\"", i, outpath.display());
            fs::create_dir_all(&outpath).unwrap();
        } else {
            println!(
                "File {} extracted to \"{}\" ({} bytes)",
                i,
                outpath.display(),
                file.size()
            );
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p).unwrap();
                }
            }
            let mut outfile = fs::File::create(&outpath).unwrap();
            io::copy(&mut file, &mut outfile).unwrap();
        }

        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).unwrap();
            }
        }
    }
}

/**
 * 从$Home/STM32Cube/Repository/中获取已安装的包
 * 每个以STMCube_FW_开头的文件夹都是一个包
 */
#[tauri::command]
async fn get_installed_package() -> Result<Vec<String>, ()> {
    let file_path = env::home_dir();
    let mut packages = Vec::new();
    if let Some(path) = file_path {
        let mut file_path = path.clone();
        file_path.push("STM32Cube");
        file_path.push("Repository");
        if !file_path.exists() {
            return Ok(packages);
        }
        for entry in fs::read_dir(file_path).unwrap() {
            let entry = entry.unwrap();
            let path = entry.path();
            if path.is_dir() {
                let file_name = path.file_name().unwrap().to_str().unwrap();
                if file_name.starts_with("STM32Cube_FW_") {
                    packages.push(file_name.to_string());
                }
            }
        }
    }
    Ok(packages)
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
enum DownloadEvent {
    #[serde(rename_all = "camelCase")]
    Started {
        url: String,
        download_id: usize,
        content_length: usize,
    },
    #[serde(rename_all = "camelCase")]
    Progress {
        download_id: usize,
        chunk_length: usize,
    },
    #[serde(rename_all = "camelCase")]
    Finished { download_id: usize },
}

#[tauri::command]
async fn download_file(
    url: String,
    save_path: String,
    on_event: Channel<DownloadEvent>,
) -> Result<(), String> {
    use tokio::io::AsyncWriteExt;
    let download_id = 1;

    // 断点续传：已下载内容保存在 <save_path>.part，成功后重命名为正式文件
    let path = std::path::PathBuf::from(&save_path);
    let part_path = std::path::PathBuf::from(format!("{}.part", save_path));
    let mut resume_from: u64 = if part_path.exists() {
        tokio::fs::metadata(&part_path)
            .await
            .map(|m| m.len())
            .unwrap_or(0)
    } else {
        0
    };

    let client = reqwest::Client::new();
    let mut request = client.get(&url);
    if resume_from > 0 {
        request = request.header("Range", format!("bytes={}-", resume_from));
    }
    let res = request
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    // 服务器返回 206 表示支持续传，从断点接着写；否则（200 等）从头下载
    let resuming = resume_from > 0 && res.status() == reqwest::StatusCode::PARTIAL_CONTENT;
    let append_mode = resuming;
    if !resuming {
        resume_from = 0;
    }

    let remaining = res
        .content_length()
        .ok_or("Failed to get content length".to_string())?;
    let total_size = resume_from + remaining;

    on_event
        .send(DownloadEvent::Started {
            url: url.clone(),
            download_id,
            content_length: total_size as usize,
        })
        .unwrap();

    let mut file = if append_mode {
        tokio::fs::OpenOptions::new()
            .append(true)
            .open(&part_path)
            .await
            .map_err(|e| format!("File open error: {}", e))?
    } else {
        tokio::fs::File::create(&part_path)
            .await
            .map_err(|e| format!("File create error: {}", e))?
    };

    let mut downloaded = resume_from;
    let mut stream = res.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Stream read error: {}", e))?;
        file.write_all(&chunk)
            .await
            .map_err(|e| format!("Write error: {}", e))?;
        downloaded += chunk.len() as u64;

        on_event
            .send(DownloadEvent::Progress {
                download_id,
                chunk_length: downloaded as usize,
            })
            .unwrap();
    }
    file.flush()
        .await
        .map_err(|e| format!("File flush error: {}", e))?;
    drop(file);

    tokio::fs::rename(&part_path, &path)
        .await
        .map_err(|e| format!("Rename error: {}", e))?;

    on_event
        .send(DownloadEvent::Finished { download_id })
        .unwrap();
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            unzip_file,
            get_installed_package,
            download_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
