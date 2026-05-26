function switchTab(screenId) {
    document.querySelectorAll('.app-screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(`${screenId}-screen`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('sage-accent');
        btn.classList.add('text-stone-400');
    });
    
    event.currentTarget.classList.add('sage-accent');
    event.currentTarget.classList.remove('text-stone-400');

    if(screenId === 'practice') {
        renderHistory();
    }
}

function toggleInjuryOptions(noInjuryCheckbox) {
    if (noInjuryCheckbox.checked) {
        document.querySelectorAll('.injury-specific').forEach(cb => {
            cb.checked = false;
        });
    }
}

document.addEventListener('change', function(e) {
    if (e.target.classList.contains('injury-specific') && e.target.checked) {
        document.getElementById('no-injury-check').checked = false;
    }
});

function submitCheckIn() {
    const selectedMood = document.getElementById('mood-input').value;
    const chosenStyle = document.getElementById('style-input').value;
    const enteredPoses = document.getElementById('poses-input').value;
    
    let physicalConcerns = [];
    document.querySelectorAll('.body-concern:checked').forEach(cb => physicalConcerns.push(cb.value));

    if (physicalConcerns.length === 0) {
        physicalConcerns.push("No Injury");
        document.getElementById('no-injury-check').checked = true;
    }

    const checkInRecord = {
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        mood: selectedMood,
        style: chosenStyle,
        poses: enteredPoses ? enteredPoses.split(',').map(p => p.trim()) : [],
        injury_area: physicalConcerns
    };
    
    let existingLogs = JSON.parse(localStorage.getItem('yoga_checkins')) || [];
    existingLogs.unshift(checkInRecord);
    localStorage.setItem('yoga_checkins', JSON.stringify(existingLogs));

    calculateRecommendations(selectedMood, physicalConcerns);
}

function calculateRecommendations(mood, concerns) {
    const box = document.getElementById('recommendation-box');
    const text = document.getElementById('recommendation-text');
    
    box.classList.remove('hidden');

    if (concerns.includes('No Injury') && (mood === 'Calm' || mood === 'Grounded' || mood === 'Happy')) {
        text.innerHTML = `Your body and mind are beautifully aligned and open today! ✨<br><br>
        <strong>Suggested Flow:</strong> A full Vinyasa Flow or a structured Ashtanga series.<br>
        <strong>Mindful Tip:</strong> Your kinetic baseline is steady. It is an amazing day to safely explore targets like Crow Pose or Pincha if it feels right.`;
    } 
    else if (concerns.includes('Lower Back') || concerns.includes('Fatigue') || concerns.includes('Neck') || mood === 'Overwhelmed' || mood === 'Anxious') {
        text.innerHTML = `Your system is asking for soft, safe spaces right now. 🍃<br><br>
        <strong>Suggested Flow:</strong> Deep Yin Yoga, Restorative structural alignment, or simple Pranayama (breathwork).<br>
        <strong>Anatomical Warning:</strong> Intentionally bypass aggressive inversions or intense core spinal extensions. Focus entirely on decompression.`;
    } 
    else {
        text.innerHTML = `Your system presents a standard, intuitive foundation today. <br><br>
        <strong>Suggested Flow:</strong> Slow Hatha exploration or an intentional mobility framework.<br>
        <strong>Mindful Tip:</strong> Move rhythmically. Listen attentively to your breathing space over pure flexibility depths.`;
    }
}

function renderHistory() {
    const container = document.getElementById('history-container');
    const logs = JSON.parse(localStorage.getItem('yoga_checkins')) || [];

    if (logs.length === 0) {
        container.innerHTML = `<p class="text-stone-400 italic text-center">No practices logged yet. Complete your first check-in above!</p>`;
        return;
    }

    container.innerHTML = '';
    
    logs.forEach(log => {
        const poseBadges = log.poses.map(p => `<span class="bg-stone-100 px-2 py-0.5 rounded text-xs text-stone-600 font-mono">${p}</span>`).join(' ');
        const concernString = log.injury_area.join(', ');

        const card = document.createElement('div');
        card.className = "p-4 bg-stone-50/50 rounded-xl border border-stone-200/60 space-y-2";
        card.innerHTML = `
            <div class="flex justify-between items-center border-b border-stone-100 pb-1">
                <span class="text-xs font-bold font-mono text-stone-400">${log.timestamp}</span>
                <span class="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">${log.style}</span>
            </div>
            <div class="text-xs text-stone-600 space-y-1">
                <div><strong>Mood Vector:</strong> ${log.mood}</div>
                <div><strong>Anatomical Mapping:</strong> <span class="${log.injury_area.includes('No Injury') ? 'text-emerald-700 font-medium' : 'text-amber-700'}">${concernString}</span></div>
                ${log.poses.length > 0 ? `<div class="mt-2 flex flex-wrap gap-1 items-center"><strong>Poses:</strong> ${poseBadges}</div>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}
