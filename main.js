document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        allJobs: [],
        allReferrals: [],
        filteredJobs: [],
        filteredReferrals: [],
        currentPage: 1,
        currentReferralPage: 1,
        activePage: window.location.pathname === '/' ? 'home' : window.location.pathname.replace('.html', '').replace('/', ''),
        isMobile: window.matchMedia("(max-width: 767px)").matches,
        filters: {
            searchTerm: '',
            location: '',
            role: ''
        },
        ui: {
            isModalOpen: false,
            isFilterScreenOpen: false
        }
    };

    // --- CONFIGURATION & ELEMENTS ---
    const JOBS_JSON_URL = 'https://ketangoel16-creator.github.io/onestopcareers-data/jobs.json';
    const REFERRALS_JSON_URL = 'https://ketangoel16-creator.github.io/onestopcareers-data/referrals.json';
    const JOBS_PER_PAGE_DESKTOP = 10;
    const JOBS_PER_PAGE_MOBILE = 6;
    const REFERRALS_PER_PAGE_WEB = 9;

    const jobGrid = document.getElementById('job-listings-grid');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noResultsMessage = document.getElementById('no-results');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const modalOverlay = document.getElementById('job-modal-overlay');
    const toolkitCarousel = document.getElementById('toolkit-carousel');
    const referralsCarouselMobile = document.getElementById('referrals-carousel-mobile');
    const referralsGridDesktop = document.getElementById('referrals-grid-desktop');
    const referralLoadMoreBtn = document.getElementById('referral-load-more-btn');

    const desktopSearchInput = document.getElementById('desktop-search-input');
    const desktopLocationFilter = document.getElementById('desktop-location-filter');
    const desktopRoleFilter = document.getElementById('desktop-role-filter');
    const desktopResetFilters = document.getElementById('desktop-reset-filters');
    
    const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    const mobileFilterScreen = document.getElementById('mobile-filter-screen');
    const closeFilterBtn = document.getElementById('close-filter-btn');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    const filterLocationSelect = document.getElementById('filter-location');
    const mobileRoleFiltersContainer = document.getElementById('mobile-role-filters');
    
    const desktopNavTabs = document.querySelectorAll('.desktop-tab-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // --- HELPER FUNCTIONS ---
    const formatDateAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const createDefaultLogo = (companyName) => {
        const firstLetter = (companyName || '?').charAt(0).toUpperCase();
        const logoDiv = document.createElement('div');
        logoDiv.className = "w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 text-5xl font-bold";
        logoDiv.textContent = firstLetter;
        return logoDiv;
    };

    // --- MAIN RENDER FUNCTION ---
    function render() {
        if (state.activePage === 'jobs') {
            renderJobs();
            renderReferrals();
        }
        if (state.activePage === 'resources') {
            renderCareerToolkit();
        }
        
        // Update navigation tabs
        if (desktopNavTabs) {
            desktopNavTabs.forEach(btn => {
                const isActive = btn.dataset.page === state.activePage;
                btn.classList.toggle('active-tab', isActive);
            });
        }
    }

    function renderJobs() {
        if (!jobGrid) return;
        
        const jobsPerPage = state.isMobile ? JOBS_PER_PAGE_MOBILE : JOBS_PER_PAGE_DESKTOP;
        const jobsToDisplay = state.filteredJobs.slice(0, state.currentPage * jobsPerPage);
        jobGrid.innerHTML = '';
        if (noResultsMessage) noResultsMessage.style.display = jobsToDisplay.length > 0 ? 'none' : 'block';

        jobsToDisplay.forEach((job) => {
            const item = document.createElement('div');
            item.className = 'job-item group flex flex-col items-center text-center p-4 transition-transform duration-300 hover:-translate-y-1 border border-transparent hover:border-gray-800 rounded-2xl';
            item.dataset.jobId = job.ID;

            item.innerHTML = `
                <div class="flex-grow w-full flex flex-col items-center">
                    <div class="relative w-32 h-32 mb-4">
                        <div class="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-110">
                            <img data-company-name="${job.Company}" src="${job['Company Logo URL']}" alt="${job.Company} Logo" class="job-logo w-full h-full object-cover">
                        </div>
                    </div>
                    <h3 class="text-lg font-semibold text-white leading-tight">${job['Job Title']}</h3>
                    <p class="text-gray-400 text-sm">${job.Company}</p>
                    <p class="text-gray-500 text-xs mt-1">📍 ${job.Location}</p>
                </div>
                <div class="job-actions mt-4 w-full flex flex-col items-center gap-2">
                    <button class="apply-btn w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">Apply</button>
                </div>
            `;
            jobGrid.appendChild(item);
        });

        document.querySelectorAll('.job-logo').forEach(img => {
            img.onerror = () => { img.replaceWith(createDefaultLogo(img.dataset.companyName)); };
        });

        if (loadMoreBtn) loadMoreBtn.parentElement.style.display = state.filteredJobs.length > (state.currentPage * jobsPerPage) ? 'block' : 'none';
    }

    function renderReferrals() {
        if (!referralsCarouselMobile && !referralsGridDesktop) return;

        const referralsToDisplay = state.isMobile ? state.allReferrals : state.allReferrals.slice(0, state.currentReferralPage * REFERRALS_PER_PAGE_WEB);
        const container = state.isMobile ? referralsCarouselMobile : referralsGridDesktop;

        container.innerHTML = '';

        if (state.isMobile) {
            referralsCarouselMobile.classList.remove('hidden');
            referralsGridDesktop.classList.add('hidden');
        } else {
            referralsGridDesktop.classList.remove('hidden');
            referralsCarouselMobile.classList.add('hidden');
        }

        referralsToDisplay.forEach((referral) => {
            const card = document.createElement('div');
            card.className = `referral-card p-6 rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-md transition-all duration-300 hover:border-orange-500/50 hover:scale-[1.02] ${state.isMobile ? 'flex-shrink-0 w-4/5' : ''}`;

            card.innerHTML = `
                <div class="flex items-center gap-4 mb-4">
                    <a href="${referral['Link']}" target="_blank" class="flex-shrink-0">
                        <div class="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-gray-800 text-gray-400 text-2xl font-bold">
                            <span class="text-white">${referral.Name.charAt(0).toUpperCase()}</span>
                        </div>
                    </a>
                    <div>
                        <h3 class="text-xl font-bold text-white">${referral.Name}</h3>
                        <p class="text-sm text-gray-400">${referral.Designation}</p>
                        <p class="text-xs text-gray-500">${referral['Company name']}</p>
                    </div>
                </div>
                <a href="${referral['Link']}" target="_blank" class="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                    Connect on LinkedIn
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            `;
            container.appendChild(card);
        });

        if (!state.isMobile && referralLoadMoreBtn) {
            referralLoadMoreBtn.parentElement.style.display = state.allReferrals.length > (state.currentReferralPage * REFERRALS_PER_PAGE_WEB) ? 'block' : 'none';
        } else {
            if (referralLoadMoreBtn) referralLoadMoreBtn.parentElement.style.display = 'none';
        }
    }

    function renderCareerToolkit() {
        if (!toolkitCarousel) return;

        const toolkitData = [
            { title: 'Resume Builder', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>', description: 'Craft the perfect resume with our AI-powered builder.' },
            { title: 'Interview Prep', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" /></svg>', description: 'Practice common questions and get instant feedback.' },
            { title: 'Salary Insights', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>', description: 'Know your worth with our real-time salary data.' }
        ];

        toolkitCarousel.innerHTML = '';
        toolkitData.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'toolkit-card bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 flex flex-col items-start gap-4 transition-all duration-300 hover:border-orange-500/50 hover:-translate-y-1';
            card.innerHTML = `<div class="p-3 bg-white/10 rounded-lg text-orange-500">${item.icon}</div><h3 class="text-lg font-bold text-white">${item.title}</h3><p class="text-sm text-gray-400 flex-grow">${item.description}</p><a href="#" class="text-sm font-medium text-orange-500 hover:text-orange-400 flex items-center gap-1">Learn More <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></a>`;
            toolkitCarousel.appendChild(card);
        });
    }

    function applyFilters() {
        const searchTerm = state.isMobile ? (document.getElementById('mobile-search-input')?.value || '').toLowerCase() : (document.getElementById('desktop-search-input')?.value || '').toLowerCase();
        const selectedLocation = state.isMobile ? (document.getElementById('filter-location')?.value || '') : (document.getElementById('desktop-location-filter')?.value || '');
        const selectedRole = state.isMobile ? document.querySelector('.mobile-role-pill.active')?.dataset.role || '' : (document.getElementById('desktop-role-filter')?.value || '');

        state.filteredJobs = state.allJobs.filter(job =>
            (searchTerm === '' || job['Job Title'].toLowerCase().includes(searchTerm) || job.Company.toLowerCase().includes(searchTerm)) &&
            (selectedLocation === '' || job.Location === selectedLocation) &&
            (selectedRole === '' || job['Job Title'] === selectedRole)
        );
        state.currentPage = 1;
        render();
    }

    function clearFilters() {
        if (state.isMobile) {
            if (document.getElementById('mobile-search-input')) document.getElementById('mobile-search-input').value = '';
            if (document.getElementById('filter-location')) document.getElementById('filter-location').value = '';
            if (document.getElementById('mobile-role-filters')) document.getElementById('mobile-role-filters').querySelectorAll('.mobile-role-pill').forEach(p => p.classList.remove('active', 'bg-orange-500'));
        } else {
            if (document.getElementById('desktop-search-input')) document.getElementById('desktop-search-input').value = '';
            if (document.getElementById('desktop-location-filter')) document.getElementById('desktop-location-filter').value = '';
            if (document.getElementById('desktop-role-filter')) document.getElementById('desktop-role-filter').value = '';
        }
        applyFilters();
    }

    function showApplyModal(job) {
        if (!modalOverlay) return;
        const content = `<div class="text-center"><div class="h-20 w-20 rounded-full bg-gray-800 mx-auto mb-4 overflow-hidden flex items-center justify-center"><img src="${job['Company Logo URL']}" alt="${job.Company} Logo" class="w-full h-full object-cover"></div><h3 class="text-2xl font-bold text-white">${job['Job Title']}</h3><p class="text-gray-400 mb-6">at ${job.Company}</p><p class="bg-gray-800 border border-gray-700 text-orange-400 text-sm rounded-lg p-3 mb-6">✨ **Pro Tip:** Tailor your resume to include keywords from the job description. Good luck!</p><div class="flex flex-col sm:flex-row gap-3"><button id="proceed-btn" class="w-full bg-gradient-to-br from-orange-500 to-orange-600 text-white font-semibold py-3 px-5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all">Proceed to Application</button><button id="cancel-btn" class="w-full bg-gray-700 text-white font-semibold py-3 px-5 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button></div></div>`;
        modalOverlay.innerHTML = `<div class="modal-content bg-gray-900 border border-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-auto p-6 md:p-8">${content}</div>`;
        modalOverlay.classList.remove('hidden');
        setTimeout(() => { modalOverlay.classList.add('open', 'opacity-100'); }, 10);
        if (document.getElementById('proceed-btn')) document.getElementById('proceed-btn').addEventListener('click', () => { window.open(job.Link, '_blank'); closeModal(); });
        if (document.getElementById('cancel-btn')) document.getElementById('cancel-btn').addEventListener('click', closeModal);
        const modalImg = modalOverlay.querySelector('img');
        if (modalImg) { modalImg.onerror = () => { modalImg.replaceWith(createDefaultLogo(job.Company)); }; }
    }

    function closeModal() {
        if (modalOverlay) modalOverlay.classList.remove('open', 'opacity-100');
        setTimeout(() => { if (modalOverlay) modalOverlay.classList.add('hidden'); }, 300);
    }

    function openFilterScreen() {
        if (mobileFilterScreen) mobileFilterScreen.style.transform = 'translateX(0)';
    }

    function closeFilterScreen() {
        if (mobileFilterScreen) mobileFilterScreen.style.transform = 'translateX(100%)';
    }

    function populateFilters() {
        const locations = [...new Set(state.allJobs.map(job => job.Location).filter(Boolean))].sort();
        if (desktopLocationFilter) {
            desktopLocationFilter.innerHTML = '<option value="">All Locations</option>';
            locations.forEach(location => desktopLocationFilter.add(new Option(location, location)));
        }
        if (filterLocationSelect) {
            filterLocationSelect.innerHTML = '<option value="">All Locations</option>';
            locations.forEach(location => filterLocationSelect.add(new Option(location, location)));
        }

        const roles = [...new Set(state.allJobs.map(job => job['Job Title']).filter(Boolean))].sort();
        if (desktopRoleFilter) {
            desktopRoleFilter.innerHTML = '<option value="">All Roles</option>';
            roles.forEach(role => desktopRoleFilter.add(new Option(role, role)));
        }
        if (mobileRoleFiltersContainer) {
            mobileRoleFiltersContainer.innerHTML = '';
            roles.forEach(role => {
                const pill = document.createElement('button');
                pill.className = 'mobile-role-pill w-full text-left p-3 bg-gray-800 text-gray-300 rounded-lg text-sm';
                pill.textContent = role;
                pill.dataset.role = role;
                mobileRoleFiltersContainer.appendChild(pill);
            });
        }
    }

    function renderJourney() {
        const journeyContainer = document.getElementById('journey-container');
        if (!journeyContainer) return;

        const stagesMap = {
            'starting-out': { title: "Just Starting Out", description: "You're at the very beginning, trying to find your footing and choose a direction that excites you. Let's build your foundation.", icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>`, substages: [ { name: "Explore Roles", subDescription: "Discover different career paths that match your interests and skills." }, { name: "Finalize a Role", subDescription: "Commit to a specific path and understand what it takes to succeed." }, { name: "Prepare a Roadmap", subDescription: "Create a step-by-step plan for the skills and experience you'll need." } ] },
            'skill-up': { title: "Skill Up & Search", description: "You know your target role, but need the skills and a powerful resume to get noticed by recruiters.", icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>`, substages: [ { name: "Find Learning Resources", subDescription: "Identify the best courses, books, and projects to build your expertise." }, { name: "Gain Practical Exposure", subDescription: "Apply your knowledge through internships, projects, or freelance work." }, { name: "Build a Killer Resume", subDescription: "Craft a resume that highlights your new skills and gets past ATS filters." } ] },
            'interview-loop': { title: "In the Interview Loop", description: "You're landing interviews but not the offers. It's time to master the art of the interview process.", icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.28-2.72a3 3 0 01-4.682-2.72a9.094 9.094 0 013.741-.479m-4.26 9.574a9.094 9.094 0 003.741.479a3 3 0 004.682 2.72m-7.28 2.72a3 3 0 014.682 2.72a9.094 9.094 0 01-3.741.479m-4.26-9.574a9.094 9.094 0 01-3.741-.479a3 3 0 014.682-2.72m7.28-2.72a3 3 0 00-4.682-2.72a9.094 9.094 0 00-3.741-.479M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`, substages: [ { name: "Application Strategy", subDescription: "Optimize how and where you apply to maximize your interview chances." }, { name: "Master Interview Rounds", subDescription: "Prepare for technical, behavioral, and situational interview questions." }, { name: "Handle Rejections", subDescription: "Learn from feedback and stay motivated after a 'no'." } ] },
            'stuck': { title: "Stuck or Unmotivated", description: "Your career has stalled, or your motivation has faded. Let's find a new perspective and get you moving again.", icon: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" /></svg>`, substages: [ { name: "Rediscover Motivation", subDescription: "Use proven techniques to reignite your professional passion and set new goals." }, { name: "Create a Feedback Loop", subDescription: "Build a system for getting constructive feedback to break through plateaus." }, ] }
        };

        const stageSelectionGrid = document.getElementById('stage-selection-grid');
        const backButton = document.getElementById('back-button');
        const findCareerStageBtn = document.getElementById('find-career-stage-btn');

        function populateStep1View() {
            if (!stageSelectionGrid) return;
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

        function populateStep2View(stageKey) {
            const stage = stagesMap[stageKey];
            if (document.getElementById('step-2-title')) document.getElementById('step-2-title').textContent = stage.title;
            if (document.getElementById('step-2-description')) document.getElementById('step-2-description').textContent = "Here is your personalized path forward. Choose an area to focus on.";
            if (document.getElementById('progress-indicator')) document.getElementById('progress-indicator').textContent = 'Step 2 of 2';
            const subStageGrid = document.getElementById('sub-stage-grid');
            if (subStageGrid) {
                subStageGrid.innerHTML = '';
                stage.substages.forEach(sub => {
                    const card = document.createElement('button');
                    card.className = 'stage-card';
                    card.innerHTML = `${stage.icon}<h3>${sub.name}</h3><p>${sub.subDescription}</p>`;
                    card.addEventListener('click', () => { /* Add action for sub-stages here */ });
                    subStageGrid.appendChild(card);
                });
            }
        }

        function navigateToStep2(stageKey) {
            populateStep2View(stageKey);
            if (journeyContainer) journeyContainer.classList.add('step-2-active');
        }

        function navigateToStep1() {
            if (journeyContainer) journeyContainer.classList.remove('step-2-active');
        }

        if (backButton) backButton.addEventListener('click', navigateToStep1);
        if (findCareerStageBtn) findCareerStageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const journeySection = document.getElementById('journey-section');
            if (journeySection) journeySection.scrollIntoView({ behavior: 'smooth' });
        });

        populateStep1View();
    }

    if (state.activePage === 'jobs') {
        const jobsPageLogic = () => {
            // ... (The rest of your jobs page logic) ...
        };
        jobsPageLogic();
    }
});
