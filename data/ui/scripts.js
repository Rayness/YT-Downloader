document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.tab-btn');
    const blocks = document.querySelectorAll('.content');
    const name = document.getElementById('name');
    
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        // Удаляем активный класс у всех кнопок и блоков
        buttons.forEach(btn => btn.classList.remove('active'));
        blocks.forEach(block => block.classList.remove('active'));
        
        // Добавляем активный класс нажатой кнопке
        this.classList.add('active');
        
        // Находим соответствующий блок и показываем его
        const tabId = this.getAttribute('data-tab');
        const block = document.getElementById(tabId)
        block.classList.add('active');

        name.textContent = block.getAttribute('data-status');
      });
    });
    
    // По желанию: активировать первую вкладку при загрузке
    buttons[0].click();
});


// Добавляем обработчик события для кнопки "Добавить в очередь"
document.getElementById('addBtn').addEventListener('click', function() {
    const videoUrl = document.getElementById('videoUrl').value;
    const selectedFormat = document.getElementById('format').value; // Получаем выбранный формат
    const selectedResolution = document.getElementById('resolution').value; // Получаем выбранное разрешение

    if (!videoUrl) {
        document.getElementById('status').innerText = 'Ошибка: Введите URL видео';
        return;
    }

    document.getElementById('status').innerText = 'Добавление в очередь...';
    showSpinner();

    // Вызываем функцию addVideoToQueue из Python через API и передаем выбранный формат
    try {
        pywebview.api.addVideoToQueue(videoUrl, selectedFormat, selectedResolution);
        document.getElementById('videoUrl').value = '';
    } catch {
        document.getElementById('status').innerHTML = 'Нет доступа'
    }

});

function showSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
    document.getElementById('addBtn').disabled = true;
    document.getElementById('startBtn').disabled = true;
}

function hideSpinner() {
    document.getElementById('loading-spinner').style.display = 'none'; 
    document.getElementById('addBtn').disabled = false;
    document.getElementById('startBtn').disabled = false;
}

document.getElementById('language').addEventListener('change', function() {
    const lang = document.getElementById('language').value || 'English';
    pywebview.api.switch_language(lang);
})

// Добавляем обработчик события для кнопки "Начать загрузку"
document.getElementById('startBtn').addEventListener('click', function() {
    // Вызываем функцию startDownload из Python через API
    pywebview.api.startDownload().then(function(response) {
        document.getElementById('status').innerText = response;
    });
});

document.getElementById('format').addEventListener('change', ()=> {
    element = document.getElementById('format');
    res = document.getElementById('resolution');


    if (element.value === 'mp3') {
        res.selectedIndex = -1;
        res.disabled = true;
    } else {
        res.disabled = false;
        res.selectedIndex = 4
    }
})

// Функция для добавления видео в список очереди
function addVideoToList(videoTitle, thumbnailUrl, format, resolution) {
    const queueList = document.getElementById("queue");
    const listItem = document.createElement("li");

    // Создаем элемент для превью
    const thumbnail = document.createElement("img");
    thumbnail.src = thumbnailUrl || "src/default_thumbnail.png"; // Если превью отсутствует, используем дефолтное изображение
    thumbnail.alt = "Превью видео";

    // Создаем контейнер для информации о видео
    const videoInfo = document.createElement("div");
    videoInfo.classList.add("video-info");
    try {
        if (format === "mp3") {
            videoInfo.innerHTML = `
                <div class="video_queue_text">${videoTitle}</div>
                <div class="video-details">
                    <p>Audio</p>
                    <p>${format}</p>
                </div>
            `
        } else {
            videoInfo.innerHTML = `
                <div class="video_queue_text">${videoTitle}</div>
                <div class="video-details">
                    <p>${resolution}p</p>
                    <p>${format}</p>
                </div>
            `
        }
    } catch (error) {
        console.log(error.message)
        document.getElementById('status').innerText = error.message;
    };


    // Создаем кнопку удаления
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Удалить";
    deleteButton.classList.add("delete-button");
    deleteButton.onclick = function () {
        removeVideoFromQueue(videoTitle); // Вызываем функцию для удаления видео
    };

    // Добавляем элементы в список
    listItem.appendChild(thumbnail);
    listItem.appendChild(videoInfo);
    listItem.appendChild(deleteButton);

    // Добавляем элемент в очередь
    queueList.appendChild(listItem);
}

// Функция для удаления видео из очереди
function removeVideoFromQueue(videoTitle) {
    window.pywebview.api.removeVideoFromQueue(videoTitle); // Вызываем API для удаления
}

window.loadQueue = function(queue) {
    const queueList = document.getElementById('queue');
    queueList.innerHTML = ""; // Очищаем перед загрузкой

    queue.forEach(video => {
        const listItem = document.createElement('li');

        // Создаем элемент для превью
        const thumbnail = document.createElement("img");
        thumbnail.src = video[4] || "src/default_thumbnail.png"; // Если превью отсутствует, используем дефолтное изображение
        thumbnail.alt = "Превью видео";

        // Создаем контейнер для информации о видео
        const videoInfo = document.createElement("div");
        videoInfo.classList.add("video-info");
        try {
            if (video[2] === "mp3") {
                videoInfo.innerHTML = `
                    <div class="video_queue_text">${video[1]}</div>
                    <div class="video-details">
                        <p>Audio</p>
                        <p>${video[2]}</p>
                    </div>
                `
            } else {
                videoInfo.innerHTML = `
                <div class="video_queue_text">${video[1]}</div>
                <div class="video-details">
                    <p>${video[3]}p</p>
                    <p>${video[2]}</p>
                </div>
                `
            }
        } catch (error) {
            console.log(error.message)
            document.getElementById('status').innerText = error.message;
        };

        // Создаем кнопку удаления
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Удалить";
        deleteButton.classList.add("delete-button");
        deleteButton.onclick = function () {
            removeVideoFromQueue(video[1]); // Вызываем функцию для удаления видео
        };

        // Добавляем текст и кнопку в элемент списка
        listItem.appendChild(thumbnail);
        listItem.appendChild(videoInfo);
        listItem.appendChild(deleteButton);

        // Добавляем элемент в очередь
        queueList.appendChild(listItem);
    });
};

// Функция для удаления видео из интерфейса
function removeVideoFromList(videoTitle) {
    const queueList = document.getElementById("queue");
    const items = queueList.getElementsByTagName("li");
    console.log(videoTitle)

    for (let i = 0; i < items.length; i++) {
        if (items[i].innerText.includes(videoTitle)) {
            queueList.removeChild(items[i]);
            break;
        }
    }
}

updateApp = function(update, translations) {
    if (update) {
        document.getElementById('update__text').innerHTML = translations.settings.update_text_ready || 'Update ready';
        update_text.style.backgroundColor=  "#5d8a51";
    } else if (!update) {
        document.getElementById('update__text').innerHTML = translations.settings.update_text_not_ready || 'Update not required';
        update_text.style.backgroundColor = "#3e4d3a";
    } else {
        document.getElementById('update__text').innerHTML = translations.settings.update_text_error || 'Update not available';
        update_text.style.backgroundColor = "#7c363d";
    }
}


// Функция для обновления текста интерфейса
window.updateTranslations = function(translations) {
    update_text = document.getElementById('update__text')

    document.getElementById('9').setAttribute('data-status', translations.sections.queue);
    document.getElementById('10').setAttribute('data-status', translations.sections.setting);

    document.getElementById('language_title').innerText = translations.settings.language || 'Language';
    document.getElementById('folder_title').innerText = translations.settings.placeholder || 'Specify the path to the download folder';

    document.getElementById('lang_ru').innerHTML = translations.settings.russian || 'Russian';
    document.getElementById('lang_en').innerHTML = translations.settings.english || 'English';

    document.getElementById('tooltip_defoult').innerHTML = translations.settings.by_defoult || 'Restore default folder'
    document.getElementById('tooltip_choose').innerHTML = translations.settings.choose_folder || 'Change download folder'
    document.getElementById('tooltip_open').innerHTML = translations.settings.open_folder || 'Open download folder'

    document.getElementById('update').innerHTML = translations.settings.update_button || 'Check';

    document.getElementById('videoUrl').placeholder = translations.video_URL || 'Enter video URL';
    document.getElementById('addBtn').innerText = translations.add_to_queue || 'Add video';
   
    document.getElementById('status').innerText = translations.status.status_text || 'Status. Waiting...';

    document.getElementById('progress').innerText = translations.progress + " 0% " || 'Progress: ';
    document.getElementById('speed').innerText = translations.speed + " 0 " + translations.bs || 'Speed: ';
    document.getElementById('eta').innerText = translations.eta + " 0 " + translations.min + " 0 " + translations.sec || 'Eta: ';
};

window.updateDownloadFolder = function(folder_path) {
    document.getElementById('folder_path').placeholder = folder_path;
}

document.getElementById("stopBtn").addEventListener('click', function() {
    window.pywebview.api.download_stop();
})

document.getElementById("chooseButton").addEventListener("click", function() {
    // Вызов метода Python через pywebview
    window.pywebview.api.choose_folder();
});

document.getElementById("byDefoult").addEventListener("click", function() {
    window.pywebview.api.switch_download_folder()
})

document.getElementById("openFolder").addEventListener("click", () =>{
    window.pywebview.api.open_folder();
})

document.getElementById("update").addEventListener("click", function(){
    window.pywebview.api.launch_update();
})

function showTooltip(message) {
    alert(message); // Простое всплывающее окно
    // Или более красивый вариант:
    const toast = document.createElement('div');
    toast.innerHTML = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = 'black';
    toast.style.color = 'white';
    toast.style.padding = '10px';
    toast.style.borderRadius = '5px';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }