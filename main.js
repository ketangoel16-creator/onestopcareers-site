// --- JAVASCRIPT FOR THE HOMEPAGE "JOURNEY" SECTION ---

document.addEventListener('DOMContentLoaded', () => {
    // Check if the required element exists on the page
    const journeyContainer = document.getElementById('journey-container');
    if (!journeyContainer) return;

    // Data map for the career stages and substages
    const stagesMap = {
        'starting-out': { 
            title: "Just Starting Out", 
            description: "You're at the very beginning, trying to find your footing and choose a direction that excites you. Let's build your foundation.", 
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>`, 
            substages: [ 
                { name: "Explore Roles", subDescription: "Discover different career paths that match your interests and skills." }, 
                { name: "Finalize a Role", subDescription: "Commit to a specific path and understand what it takes to succeed." }, 
                { name: "Prepare a Roadmap", subDescription: "Create a step-by-step plan for the skills and experience you'll need." } 
            ] 
        },
        'skill-up': { 
            title: "Skill Up & Search", 
            description: "You know your target role, but need the skills and a powerful resume to get noticed by recruiters.", 
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>`, 
            substages: [ 
                { name: "Find Learning Resources", subDescription: "Identify the best courses, books, and projects to build your expertise." }, 
                { name: "Gain Practical Exposure", subDescription: "Apply your knowledge through internships, projects, or freelance work." }, 
                { name: "Build a Killer Resume", subDescription: "Craft a resume that highlights your new skills and gets past ATS filters." } 
            ] 
        },
        'interview-loop': { 
            title: "In the Interview Loop", 
            description: "You're landing interviews but not the offers. It's time to master the art of the interview process.", 
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.28-2.72a3 3 0 01-4.682-2.72a9.094 9.094 0 013.741-.479m-4.26 9.574a9.094 9.094 0 003.741.479a3 3 0 004.682 2.72m-7.28 2.72a3 3 0 014.682 2.72a9.094 9.094 0 01-3.741.479m-4.26-9.574a9.094 9.094 0 01-3.741-.479a3 3 0 014.682-2.72m7.28-2.72a3 3 0 00-4.682-2.72a9.094 9.094 0 00-3.741-.479M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`, 
            substages: [ 
                { name: "Application Strategy", subDescription: "Optimize how and where you apply to maximize your interview chances." }, 
                { name: "Master Interview Rounds", subDescription: "Prepare for technical, behavioral, and situational interview questions." }, 
                { name: "Handle Rejections", subDescription: "Learn from feedback and stay motivated after a 'no'." } 
            ] 
        },
        'stuck': { 
            title: "Stuck or Unmotivated", 
            description: "Your career has stalled, or your motivation has faded. Let's find a new perspective and get you moving again.", 
            icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" /></svg>`, 
            substages: [ 
                { name: "Rediscover Motivation", subDescription: "Use proven techniques to reignite your professional passion and set new goals." }, 
                { name: "Create a Feedback Loop", subDescription: "Build a system for getting constructive feedback to break through plateaus." }, 
            ] 
        }
    };
    
    // Element selectors
    const stageSelectionGrid = document.getElementById('stage-selection-grid');
    const backButton = document.getElementById('back-button');
    const findCareerStageBtn = document.getElementById('find-career-stage-btn');

    // Function to populate the main stage selection view
    function populateStep1View() {
        stageSelectionGrid.innerHTML = '';
        for (const key in stagesMap) {
            const stage = stagesMap[key];
            const card = document.createElement('button');
            card.className = 'stage-card';
            card.dataset.stage = key;
            card.innerHTML = `${stage.icon}<h3>${stage.title}</h3><p>${stage.description}</p>`;
            card.addEventListener('click', () => navigateToStep2(key));
            stageSelectionGrid.appendChild(card);
        }
    }

    // Function to populate the sub-stage view
    function populateStep2View(stageKey) {
        const stage = stagesMap[stageKey];
        document.getElementById('step-2-title').textContent = stage.title;
        document.getElementById('step-2-description').textContent = "Here is your personalized path forward. Choose an area to focus on.";
        document.getElementById('progress-indicator').textContent = 'Step 2 of 2';
        const subStageGrid = document.getElementById('sub-stage-grid');
        subStageGrid.innerHTML = '';
        stage.substages.forEach(sub => {
            const card = document.createElement('button');
            card.className = 'stage-card';
            card.innerHTML = `${stage.icon}<h3>${sub.name}</h3><p>${sub.subDescription}</p>`;
            card.addEventListener('click', () => { /* Add action for sub-stages here */ });
            subStageGrid.appendChild(card);
        });
    }
    
    // Function to navigate to the sub-stage view with a CSS class
    function navigateToStep2(stageKey) {
        populateStep2View(stageKey);
        journeyContainer.classList.add('step-2-active');
    }

    // Function to navigate back to the main stage selection view
    function navigateToStep1() {
        journeyContainer.classList.remove('step-2-active');
    }
    
    // Event listeners
    backButton.addEventListener('click', navigateToStep1);
    findCareerStageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('journey-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Initial call to populate the first view
    populateStep1View();
});
