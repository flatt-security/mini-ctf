document.addEventListener('DOMContentLoaded', function() {
    const fileSelect = document.getElementById('fileSelect');
    const loadButton = document.getElementById('loadButton');
    const contentDiv = document.getElementById('content');

    loadButton.addEventListener('click', async function() {
        const selectedFile = fileSelect.value;
        
        if (!selectedFile) {
            showError('ファイルを選択してください。');
            return;
        }

        loadButton.disabled = true;
        loadButton.textContent = '読み込み中...';

        try {
            const response = await fetch(selectedFile);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            showContent(selectedFile, text);
        } catch (error) {
            showError(`ファイルの読み込みに失敗しました: ${error.message}`);
        } finally {
            loadButton.disabled = false;
            loadButton.textContent = 'ファイルを読み込む';
        }
    });

    function showContent(filename, content) {
        contentDiv.innerHTML = `
            <h3>読み込み完了: ${filename}</h3>
            <pre>${escapeHtml(content)}</pre>
        `;
    }

    function showError(message) {
        contentDiv.innerHTML = `
            <div class="error">
                <strong>エラー:</strong> ${escapeHtml(message)}
            </div>
        `;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});