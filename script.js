const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';

fetch(sheetUrl)
    .then(response => response.text())
    .then(csvData => processSheetData(csvData))
    .catch(error => console.error('Error loading the sheet:', error));

function processSheetData(csvData) {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split('\t');

    const container = document.querySelector('.container');
    const tagFilters = new Set();  // To hold unique tags
    const providerFilters = new Set();
    const sectionMap = {};

    for (let i = 1; i < lines.length; i++) {
        const entry = parseLine(lines[i]);
        addToFilters(entry, tagFilters, providerFilters);
        const item = createItem(entry);

        if (!sectionMap[entry.firstLetter]) {
            sectionMap[entry.firstLetter] = [];
        }
        sectionMap[entry.firstLetter].push(item);
    }

    createLetterSections(sectionMap, container);
    const {sortedTagFilters, sortedProviderFilters} = sortFilters(tagFilters, providerFilters);
    createFilterControls(sortedTagFilters, sortedProviderFilters);
}

function parseLine(line) {
    const parts = line.split('\t');
    const name = parts[0];
    const provider = parts[1];
    const imageUrl = parts[2];
    const databaseUrl = parts[3];
    const databaseDescriptionText = parts[4];
    const tags = parts.slice(5);

    let firstLetter = name.trim().charAt(0).toUpperCase();
    if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

    return { name, provider, imageUrl, databaseUrl, databaseDescriptionText, tags, firstLetter };
}

function addToFilters(entry, tagFilters, providerFilters) {
    if (entry.provider) providerFilters.add(entry.provider);
    entry.tags.forEach(tag => {
        const cleanTag = tag.trim().replace(/\s+/g, ' ').replace(/\u00A0/g, ' ');
        if (cleanTag) tagFilters.add(cleanTag);
    });
}
function createItem(entry) {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.tags = entry.tags.join(',');
    div.dataset.provider = entry.provider;

    const logoFrame = document.createElement('div');
    logoFrame.className = 'logo-frame';
    const img = document.createElement('img');
    img.src = entry.imageUrl;
    logoFrame.appendChild(img);
    // div.appendChild(img); --> eventually bring this back because the url for the detail page should be in a description rather than on the image no one will find it otherwise

    const detailLink = document.createElement('a');
    detailLink.href = `detail.html?name=${encodeURIComponent(entry.name)}`;
    detailLink.style.textDecoration = 'none';
    detailLink.appendChild(logoFrame);
    div.appendChild(detailLink);

    const nameAndDescription = document.createElement('div');
    nameAndDescription.className = 'text-block';
    nameAndDescription.style.display = 'inline';
    nameAndDescription.style.whiteSpace = 'normal';

    const databaseLink = document.createElement('a');
    databaseLink.href = entry.databaseUrl;
    p = entry.provider != '' ? ' (' + entry.provider + ')' : '';
    databaseLink.textContent = entry.name + p;
    databaseLink.target = '_blank';
    // databaseLink.setAttribute('target', '_blank');
    databaseLink.className = 'database-name';

    const databaseDescription = document.createElement('span');
    databaseDescription.textContent = '- ' + entry.databaseDescriptionText;
    databaseDescription.style.fontSize = '0.9em';
    databaseDescription.className = 'description';

    nameAndDescription.appendChild(databaseLink);
    nameAndDescription.appendChild(databaseDescription);
    div.appendChild(nameAndDescription);

    return div;
}

function createLetterSections(sectionMap, container){
    Object.keys(sectionMap).sort().forEach(letter => {
        const section = document.createElement('div');
        section.className = 'letter-section';
        section.dataset.letter = letter;
    
        const heading = document.createElement('h3');
        heading.className = 'letter-heading';
        heading.textContent = letter;

        section.appendChild(heading);
        sectionMap[letter].forEach(item => section.appendChild(item));    
        container.appendChild(section);
    });
}

function sortFilters(tagFilters, providerFilters) {
    return {
        sortedTagFilters: Array.from(tagFilters).sort(),
        sortedProviderFilters: Array.from(providerFilters).sort()
    };
}

function createFilterControls(tags, providers){
    const tagFiltersContainer = document.querySelector('.tagFilters');
    const providerFiltersContainer = document.querySelector('.providerFilters');

    const tagDropdown = createDropdown('All Tags', tags, tagFiltersContainer);
    const providerDropdown = createDropdown('All Providers', providers, providerFiltersContainer);

    const alphabetContainer = document.querySelector('.alphabetFilter');
    const alphabetButtons = {};
    const availableLetters = new Set();
    let selectedLetterFilter = null;

    document.querySelectorAll('.item').forEach(item => {
        let firstLetter = item.querySelector('.database-name').textContent.trim().charAt(0).toUpperCase();
        if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';
        availableLetters.add(firstLetter);
    });

    const allButton = document.createElement('button');
    allButton.textContent = 'All';
    allButton.classList.add('active');
    allButton.addEventListener('click', () => {
        selectedLetterFilter = null;
        updateAlphabetButtons();
        applyFilters();
    });
    alphabetContainer.appendChild(allButton);

    const alphabet = ['#'].concat(Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)));
    alphabet.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.disabled = !availableLetters.has(letter);
        button.addEventListener('click', () => {
            selectedLetterFilter = letter;
            updateAlphabetButtons();
            applyFilters();
        });
        alphabetButtons[letter] = button;
        alphabetContainer.appendChild(button);
    });

    function applyFilters(){
        const selectedTag = tagDropdown.value;
        const selectedProvider = providerDropdown.value;

        const filteringByTagOrProvider = selectedTag !== 'all' || selectedProvider !== 'all';
        const filteringByLetter = !!selectedLetterFilter;
        const visibleLetters = new Set();

        document.querySelectorAll('.item').forEach(item => {
            const nameText = item.querySelector('.database-name').textContent.trim();
            let firstLetter = nameText.charAt(0).toUpperCase();
            if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';
            
            const tagsArray = item.dataset.tags.split(',');
            const matchesTag = selectedTag === 'all' || tagsArray.includes(selectedTag);
            const matchesProvider = selectedProvider === 'all' || item.dataset.provider == selectedProvider;
            const matchesLetter = !selectedLetterFilter || firstLetter === selectedLetterFilter;
    
            const visible = matchesTag && matchesProvider && matchesLetter;
    
            item.style.display = visible ? 'flex' : 'none';
            if (visible) visibleLetters.add(firstLetter);
        });

        document.querySelectorAll('.letter-section').forEach(section => {
            const hasVisible = Array.from(section.querySelectorAll('.item')).some(
                item => item.style.display !== 'none'
            );
            section.style.display = hasVisible ? 'block' : 'none';
        });

        if (!filteringByLetter) {
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                const btn = alphabetButtons[letter];
                if (!btn) continue;
                btn.disabled = filteringByTagOrProvider ? !visibleLetters.has(letter) : !availableLetters.has(letter);
            }
    
            const numberBtn = alphabetButtons['#'];
            if (numberBtn) {
                numberBtn.disabled = filteringByTagOrProvider ? !visibleLetters.has('#') : !availableLetters.has('#');
            }
        }
    }

    function updateAlphabetButtons() {
        document.querySelectorAll('.alphabetFilter button').forEach(btn => btn.classList.remove('active'));
        if (!selectedLetterFilter) {
            allButton.classList.add('active');
        } else {
            alphabetButtons[selectedLetterFilter]?.classList.add('active');
        }
    }

    tagDropdown.addEventListener('change', () => {
        selectedLetterFilter = null;
        updateAlphabetButtons();
        applyFilters();
    });

    providerDropdown.addEventListener('change', () => {
        selectedLetterFilter = null;
        updateAlphabetButtons();
        applyFilters();
    });
}

function createDropdown(defaultText, options, container) {
    const dropdown = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = defaultText;
    dropdown.appendChild(defaultOption);

    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        dropdown.appendChild(option);
    });

    container.appendChild(dropdown);
    return dropdown;
}