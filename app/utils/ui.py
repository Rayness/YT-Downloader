# Copyright (C) 2025 Rayness
# This program is free software under GPLv3. See LICENSE for details.

import webview
from app.utils.utils import get_local_version


def createwindow(html_file_path, api):
    version = get_local_version()
    # Создаем окно с HTML-контентом
    window = webview.create_window(
        f'ClipTide {version}',
        html_file_path,
        js_api=api, # Передаем API для взаимодействия с JavaScript
        height=780,
        width=1000,
        resizable=True,
        text_select=True
    )

    return window

