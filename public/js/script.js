document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('promptInput');
    const submitPromptBtn = document.getElementById('submitPrompt');
    const responseDiv = document.getElementById('response');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const charCount = document.getElementById('charCount');
    const responseStats = document.getElementById('responseStats');
    const clearResponseBtn = document.getElementById('clearResponse');
    const exampleChips = document.querySelectorAll('.example-chip');

    updateCharCount();
    
    promptInput.addEventListener('input', updateCharCount);
    
    function updateCharCount() {
        const count = promptInput.value.length;
        charCount.textContent = `${count} aksara`;
        
        if (count > 2000) {
            charCount.style.color = '#e74c3c';
        } else if (count > 1500) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '#666';
        }
    }
    
    submitPromptBtn.addEventListener('click', async function() {
        await sendPromptToAI();
    });
    
    clearResponseBtn.addEventListener('click', function() {
        responseDiv.innerHTML = `
            <div class="placeholder-text">
                <p>Responded...</p>
            </div>
        `;
        responseStats.innerHTML = '';
        showMessage(errorMessage, 'Obrolan geus dipupus', 'success');
    });

    exampleChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            promptInput.value = prompt;
            updateCharCount();
            promptInput.focus();
        });
    });
    
    async function sendPromptToAI() {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            showMessage(errorMessage, 'Mangga ketikkeun heula patarosanana!', 'error');
            return;
        }
        
        if (prompt.length > 2000) {
            showMessage(errorMessage, 'Patarosan panjang teuing. Maksimal 2000 aksara.', 'error');
            return;
        }
        
        loadingIndicator.style.display = 'block';
        errorMessage.style.display = 'none';
        responseDiv.innerHTML = '<p>MidAI keur mikirkeun jawaban anu pangsaena dina basa Sunda...</p>';
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Aya gangguan dina server');
            }
            
            if (data.success) {
                responseDiv.textContent = data.response;
                addResponseStats(data.response);
            } else {
                throw new Error('Gagal meunang jawaban ti AI');
            }
            
        } catch (error) {
            console.error('Error:', error);
            showMessage(errorMessage, `Error: ${error.message}`, 'error');
            responseDiv.innerHTML = `
                <div class="placeholder-text">
                    <p>Hapunten, aya gangguan nalika ngolah patarosan anjeun.</p>
                    <p>Mangga cobian deui atawa pariksa sambungan internét anjeun.</p>
                </div>
            `;
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }
    
    function addResponseStats(responseText) {
        const wordCount = responseText.split(/\s+/).length;
        const charCount = responseText.length;
        const readingTime = Math.ceil(wordCount / 200);
        
        responseStats.innerHTML = `
            <span>${wordCount.toLocaleString('id-ID')} kecap</span>
            <span>${charCount.toLocaleString('id-ID')} aksara</span>
            <span>${readingTime} menit maca</span>
        `;
    }
    
    function showMessage(element, message, type) {
        element.textContent = message;
        element.style.display = 'block';
        element.className = type;
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
    
    promptInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            sendPromptToAI();
        }
    });

    promptInput.focus();

});

