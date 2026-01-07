document.addEventListener('DOMContentLoaded', () => {
    // 1. Easter Egg Logic for February
    const flipper = document.querySelector('.secret-flipper');
    if (flipper) {
        initFebEasterEgg(flipper);
    }

    function initFebEasterEgg(card) {
        let resetTimer = null;
        const audio = new Audio('assets/audio/allo_salam.mp3');

        const triggerFlip = (e) => {
            e.preventDefault();

            if (card.classList.contains('is-flipped')) return;

            // Flip the card
            card.classList.add('is-flipped');

            // Play the "Allo Salam" audio
            audio.currentTime = 0; // Reset to start if already played
            audio.play().catch(err => console.log("Audio play blocked:", err));

            // Auto-reset after 3 seconds
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                card.classList.remove('is-flipped');
            }, 3000);
        };

        // Double Click / Double Tap Trigger
        card.addEventListener('dblclick', triggerFlip);
    }

});

/**
 * Switch between different timeline years (2024 / 2025 / 2026)
 * @param {string} year - The year to display
 * @param {boolean} showScroll - Whether to scroll (default true)
 */
function switchYear(year, showScroll = true) {
    if (year === '2024') {
        const modal = document.getElementById('construction-modal');
        if (modal) {
            modal.classList.add('active');
            // Play a sound if desired, or just show visuals
        }
        return;
    }

    // 1. Update Buttons State
    document.querySelectorAll('.year-link').forEach(link => {
        link.classList.remove('active');
    });
    const btn = document.getElementById(`btn-${year}`);
    if (btn) btn.classList.add('active');

    // 2. Update Timeline Visibility
    document.querySelectorAll('.timeline-year').forEach(timeline => {
        timeline.classList.remove('active');
        // Clear any inline styles set by the immediate initialization script
        timeline.style.display = '';
        timeline.style.opacity = '';
        timeline.style.animation = '';
    });
    const timeline = document.getElementById(`timeline-${year}`);
    if (timeline) timeline.classList.add('active');

    // 3. Persist selection
    localStorage.setItem('selectedYear', year);

    // 4. Scroll to top if requested
    if (showScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function closeConstructionModal() {
    const modal = document.getElementById('construction-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Prediction Feature Logic

function openPredictionModal() {
    const modal = document.getElementById('prediction-modal');
    if (modal) {
        modal.classList.add('active');
        // Initialize 3D Classes
        updateCarouselClasses();
    }
}

function closePredictionModal() {
    const modal = document.getElementById('prediction-modal');
    if (modal) modal.classList.remove('active');
}

let currentSlideIndex = 0;



function moveCarousel(direction) {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);

    currentSlideIndex += direction;

    if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    } else if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    }

    updateCarouselClasses(slides);
}

function updateCarouselClasses(slides) {
    if (!slides) {
        slides = Array.from(document.querySelectorAll('.carousel-slide'));
    }

    // Clear all connection classes
    slides.forEach(slide => {
        slide.classList.remove('active', 'prev', 'next', 'current-slide');
    });

    // 1. Active (Center)
    slides[currentSlideIndex].classList.add('active', 'current-slide');

    // 2. Previous (Left)
    let prevIndex = currentSlideIndex - 1;
    if (prevIndex < 0) prevIndex = slides.length - 1;
    slides[prevIndex].classList.add('prev');

    // 3. Next (Right)
    let nextIndex = currentSlideIndex + 1;
    if (nextIndex >= slides.length) nextIndex = 0;
    slides[nextIndex].classList.add('next');
}

function submitCurrentPrediction() {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const currentSlide = slides[currentSlideIndex];

    if (currentSlide) {
        const id = currentSlide.dataset.id;
        const name = currentSlide.dataset.name;
        makePrediction(id, name);
    }
}

function makePrediction(characterId, characterName) {
    // 1. Save to Local Storage
    localStorage.setItem('prediction_2026_id', characterId);
    localStorage.setItem('prediction_2026_name', characterName);

    // 2. Update UI
    updatePredictionUI(characterId);

    // 3. Close Modal
    closePredictionModal();
}


function resetPrediction(e) {
    if (e) e.stopPropagation();
    localStorage.removeItem('prediction_2026_id');
    localStorage.removeItem('prediction_2026_name');

    // Restore Question Mark UI
    const box = document.getElementById('box-jan-2026');
    if (box) {
        box.innerHTML = `
            <div class="prediction-placeholder" onclick="openPredictionModal()">
                <div class="question-mark">?</div>
                <span class="predict-label">PRÉDICTION</span>
            </div>
            <div class="triangle-indicator"></div>
        `;
    }
}

function updatePredictionUI(characterId) {
    const box = document.getElementById('box-jan-2026');
    if (!box) return;

    const isLocked = localStorage.getItem('prediction_2026_locked') === 'true';
    const characterName = localStorage.getItem('prediction_2026_name') || '';

    // Environment check: Only show reset button if running locally (only for the creator)
    const isLocal = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.protocol === 'file:';

    // Determine extension (Buu and Vegeta SSJ3 use .jpg, others .png)
    const ext = (characterId === 'pred_buu' || characterId === 'pred_vegeta_ssj3_daima') ? 'jpg' : 'png';

    // Build the UI
    box.innerHTML = `
        <div class="prediction-result ${isLocked ? 'is-locked' : ''}">
            <div class="prediction-status-badge">${isLocked ? 'PRÉDICTION VALIDÉE' : 'VOTRE PRÉDICTION'}</div>
            <div class="character-wrapper">
                <img src="assets/${characterId}.${ext}" class="char-art" alt="Prediction">
                <div class="card-name-large">${characterName}</div>
            </div>
            ${!isLocked ? `
                <div class="prediction-controls">
                    <button class="result-btn btn-changer">CHANGER</button>
                    <button class="result-btn btn-valider">VALIDER</button>
                </div>
            ` : (isLocal ? `
                <div class="local-reset-wrapper">
                    <button class="local-only-reset" title="Réinitialiser (Local uniquement - Créateur)">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>
            ` : '')}
            <div class="triangle-indicator"></div>
        </div>
    `;

    // Add listeners only if not locked
    if (!isLocked) {
        const changerBtn = box.querySelector('.btn-changer');
        if (changerBtn) {
            changerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openPredictionModal();
            });
        }

        const validerBtn = box.querySelector('.btn-valider');
        if (validerBtn) {
            validerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Voulez-vous valider cette prédiction ? Vous ne pourrez plus la changer.')) {
                    lockPrediction();
                }
            });
        }
    } else if (isLocal) {
        // Local reset for the owner (discreet and only on local dev)
        const localResetBtn = box.querySelector('.local-only-reset');
        if (localResetBtn) {
            localResetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                localStorage.removeItem('prediction_2026_locked');
                resetPrediction();
            });
        }
    }
}

function lockPrediction() {
    localStorage.setItem('prediction_2026_locked', 'true');
    const savedId = localStorage.getItem('prediction_2026_id');
    updatePredictionUI(savedId);
}

// Check for existing prediction on load
document.addEventListener('DOMContentLoaded', () => {
    const savedPrediction = localStorage.getItem('prediction_2026_id');
    if (savedPrediction) {
        updatePredictionUI(savedPrediction);
    }
});
