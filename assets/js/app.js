const DATA_URL = './data/subjects.json';

// Helper: Get URL Parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Helper: Fetch Data
async function fetchData() {
    try {
        const response = await fetch(DATA_URL);
        return await response.json();
    } catch (error) {
        console.error("Error loading data:", error);
        document.body.innerHTML = "<h1>Error loading data.</h1>";
    }
}

// PAGE: index.html (Semester Selection)
async function initLanding() {
    // Only sem4 is active per brief
}

// PAGE: department.html
async function initDepartment() {
    const sem = getQueryParam('sem');
    const dept = getQueryParam('dept');
    const data = await fetchData();
    const semData = data[`sem${sem}`];

    // State 1: Select Department
    if (!dept) {
        document.getElementById('dept-select-view').classList.remove('hidden');
        document.getElementById('dept-hub-view').classList.add('hidden');
        
        // Setup links logic (Economics active, others dummy)
        const ecoCard = document.getElementById('dept-eco');
        ecoCard.href = `department.html?sem=${sem}&dept=economics`;
    } 
    // State 2: Department Hub
    else {
        document.getElementById('dept-select-view').classList.add('hidden');
        document.getElementById('dept-hub-view').classList.remove('hidden');
        
        const deptData = semData[dept];
        document.getElementById('dept-title').innerText = dept.charAt(0).toUpperCase() + dept.slice(1) + " Department";

        // 1. Render Major Papers
        const majorContainer = document.getElementById('major-list');
        for (const [code, info] of Object.entries(deptData.major)) {
            majorContainer.innerHTML += `
                <a href="subject.html?sem=${sem}&dept=${dept}&type=major&code=${code}" class="card active">
                    <span class="card-code">${code}</span>
                    <span class="card-title">${info.title}</span>
                </a>`;
        }

        // 2. Render AEC
        const aecContainer = document.getElementById('aec-list');
        for (const [code, info] of Object.entries(deptData.aec)) {
            aecContainer.innerHTML += `
                <a href="subject.html?sem=${sem}&dept=${dept}&type=aec&code=${code}" class="card active">
                    <span class="card-code">${code}</span>
                    <span class="card-title">${info.title}</span>
                </a>`;
        }

        // 3. Render Minor Options
        const minorContainer = document.getElementById('minor-list');
        for (const [subName, info] of Object.entries(deptData.minor)) {
            minorContainer.innerHTML += `
                <a href="subject.html?sem=${sem}&dept=${dept}&type=minor&minor=${subName}&code=${info.code}" class="card active">
                    <span class="card-code">${info.code}</span>
                    <span class="card-title">${info.title} (${subName})</span>
                </a>`;
        }

        // 4. WhatsApp Resource
        if(deptData.whatsapp) {
            document.getElementById('wa-link').href = deptData.whatsapp;
        } else {
            document.getElementById('wa-link').style.display = 'none';
        }
    }
}

// PAGE: subject.html
async function initSubject() {
    const sem = getQueryParam('sem');
    const dept = getQueryParam('dept');
    const type = getQueryParam('type'); // major, aec, minor
    const code = getQueryParam('code');
    const minorSubject = getQueryParam('minor'); // only for type=minor

    const data = await fetchData();
    let subjectData = null;

    // Drill down into JSON
    if (type === 'minor') {
        subjectData = data[`sem${sem}`][dept]['minor'][minorSubject];
    } else {
        subjectData = data[`sem${sem}`][dept][type][code];
    }

    if (!subjectData) {
        document.body.innerHTML = "<h1>Subject not found</h1>";
        return;
    }

    // Render Header
    document.getElementById('sub-code').innerText = code;
    document.getElementById('sub-title').innerText = subjectData.title;
    document.getElementById('meta-info').innerText = `${dept.toUpperCase()} | Semester ${sem}`;

    // Render Tabs (Only if link exists)
    const resources = ['syllabus', 'notes', 'pyq', 'quiz', 'slides'];
    const tabContainer = document.getElementById('tab-container');

    resources.forEach(res => {
        const link = subjectData[res];
        if (link && link.length > 0) {
            const label = res.charAt(0).toUpperCase() + res.slice(1); // Capitalize
            tabContainer.innerHTML += `
                <a href="${link}" target="_blank" class="tab-link">
                    <span>${label}</span>
                    <span>↗</span>
                </a>
            `;
        }
    });

    if (tabContainer.innerHTML === "") {
        tabContainer.innerHTML = "<p style='color:#666; text-align:center; margin-top:2rem;'>No resources available yet.</p>";
    }
}