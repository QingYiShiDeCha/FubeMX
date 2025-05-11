use futures_util::StreamExt;
use reqwest;
use serde::Serialize;
use std::env;
use std::fs;
use std::io;
use tauri::{ipc::Channel, AppHandle};
use tokio::fs::create_dir_all;
use zip::ZipArchive;

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
    let client = reqwest::Client::new();
    let download_id = 1;

    let res = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    let total_size = res
        .content_length()
        .ok_or("Failed to get content length".to_string())?;

    on_event
        .send(DownloadEvent::Started {
            url: url.clone(),
            download_id,
            content_length: total_size as usize,
        })
        .unwrap();

    let mut stream = res.bytes_stream();

    let path = std::path::PathBuf::from(save_path);
    let mut file = tokio::fs::File::create(&path)
        .await
        .map_err(|e| format!("File create error: {}", e))?;

    let mut downloaded = 0;

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
