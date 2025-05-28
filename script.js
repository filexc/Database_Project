const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';

fetch(sheetUrl)
    .then(response => response.text())
    .then(csvData => processSheetData(csvData))
    .catch(error => console.error('Error loading the sheet:', error));

function processSheetData(csvData) {
    const lines = csvData.trim().split('\n');
    const container = document.querySelector('.container');
    const sectionMap = {};

    const tagHierarchy = {};
    const providerFilters = new Set();

    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No results match your filters.';
    emptyMessage.style.display = 'none';
    container.appendChild(emptyMessage);

    for (let i = 1; i < lines.length; i++) {
        const entry = parseLine(lines[i]);
        buildTagHierarchy(entry, tagHierarchy);
        if (entry.provider) providerFilters.add(entry.provider);

        const item = createItem(entry);

        if (!sectionMap[entry.firstLetter]) sectionMap[entry.firstLetter] = [];
        sectionMap[entry.firstLetter].push(item);
    }

    createLetterSections(sectionMap, container);
    const sortedProviderFilters = Array.from(providerFilters).sort();
    createFilterControls(tagHierarchy, sortedProviderFilters);
    applyFilters();
}

function parseLine(line) {
    const parts = line.split('\t');
    const name = parts[0];
    const provider = parts[1];
    const imageUrl = parts[2];
    const databaseUrl = parts[3];
    const databaseDescriptionText = parts[4];
    const tags = parts.slice(5).map(tag => tag.trim()).filter(Boolean);
    const [tag1, tag2, tag3] = tags;

    let firstLetter = name.trim().charAt(0).toUpperCase();
    if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

    return { name, provider, imageUrl, databaseUrl, databaseDescriptionText, tag1, tag2, tag3, tags, firstLetter };
}

function buildTagHierarchy(entry, tagHierarchy) {
    if (!entry.tag1) return;

    if (!tagHierarchy[entry.tag1]) tagHierarchy[entry.tag1] = {};
    if (entry.tag2) {
        if (!tagHierarchy[entry.tag1][entry.tag2]) tagHierarchy[entry.tag1][entry.tag2] = new Set();
        if (entry.tag3) tagHierarchy[entry.tag1][entry.tag2].add(entry.tag3);
    }
}

function createItem(entry) {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.tag1 = entry.tag1 || '';
    div.dataset.tag2 = entry.tag2 || '';
    div.dataset.tag3 = entry.tag3 || '';
    div.dataset.provider = entry.provider || '';

    const logoFrame = document.createElement('div');
    logoFrame.className = 'logo-frame';
    const img = document.createElement('img');
    img.src = entry.imageUrl;
    logoFrame.appendChild(img);
    div.appendChild(logoFrame);

    const nameAndDescription = document.createElement('div');
    nameAndDescription.className = 'text-block';

    const link = document.createElement('a');
    link.href = entry.databaseUrl;
    link.textContent = entry.name + (entry.provider ? ` (${entry.provider})` : '');
    link.target = '_blank';
    link.className = 'database-name';

    const desc = document.createElement('span');
    desc.textContent = ' - ' + entry.databaseDescriptionText;
    desc.className = 'description';

    nameAndDescription.appendChild(link);
    nameAndDescription.appendChild(desc);
    div.appendChild(nameAndDescription);

    return div;
}

function createLetterSections(sectionMap, container) {
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

let selectedLetterFilter = null;
let applyFilters;
let updateAlphabetButtons;

function createFilterControls(tagHierarchy, providers) {
    const tagFiltersContainer = document.querySelector('.tagFilters');
    const providerFiltersContainer = document.querySelector('.providerFilters');

    const tag1Select = createDropdown('All Tag1', Object.keys(tagHierarchy), tagFiltersContainer);
    const tag2Select = createDropdown('All Tag2', [], tagFiltersContainer);
    const tag3Select = createDropdown('All Tag3', [], tagFiltersContainer);

    tag2Select.style.display = 'none';
    tag3Select.style.display = 'none';

    const providerSelect = createDropdown('All Providers', providers, providerFiltersContainer);

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Filters';
    clearButton.className = 'clear-button';
    clearButton.disabled = true;
    document.querySelector('.filterBar').appendChild(clearButton);

    const alphabetContainer = document.querySelector('.alphabetFilter');
    const alphabetButtons = {};
    const availableLetters = new Set();

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

    function updateTagDropdowns() {
        const tag1Val = tag1Select.value;
        tag2Select.innerHTML = '';
        tag3Select.innerHTML = '';

        tag2Select.style.display = 'none';
        tag3Select.style.display = 'none';

        if (tag1Val !== 'all' && tagHierarchy[tag1Val]) {
            const tag2Options = Object.keys(tagHierarchy[tag1Val]);
            if (tag2Options.length) {
                addDropdownOptions(tag2Select, 'All Tag2', tag2Options);
                tag2Select.style.display = 'inline-block';
            }
        }
    }

    tag1Select.addEventListener('change', () => {
        tag2Select.value = 'all';
        tag3Select.value = 'all';
        updateTagDropdowns();
        applyFilters();
    });

    tag2Select.addEventListener('change', () => {
        const tag1Val = tag1Select.value;
        const tag2Val = tag2Select.value;

        tag3Select.innerHTML = '';
        tag3Select.style.display = 'none';

        if (tag1Val !== 'all' && tag2Val !== 'all' && tagHierarchy[tag1Val]?.[tag2Val]) {
            const tag3Options = Array.from(tagHierarchy[tag1Val][tag2Val]);
            if (tag3Options.length) {
                addDropdownOptions(tag3Select, 'All Tag3', tag3Options);
                tag3Select.style.display = 'inline-block';
            }
        }

        applyFilters();
    });

    tag3Select.addEventListener('change', applyFilters);
    providerSelect.addEventListener('change', applyFilters);
    clearButton.addEventListener('click', () => {
        tag1Select.value = 'all';
        tag2Select.value = 'all';
        tag3Select.value = 'all';
        tag2Select.style.display = 'none';
        tag3Select.style.display = 'none';
        providerSelect.value = 'all';
        selectedLetterFilter = null;
        updateAlphabetButtons();
        applyFilters();
    });

    applyFilters = function () {
        const tag1 = tag1Select.value;
        const tag2 = tag2Select.value;
        const tag3 = tag3Select.value;
        const provider = providerSelect.value;

        const filteringByLetter = !!selectedLetterFilter;
        const filteringByTagOrProvider = tag1 !== 'all' || tag2 !== 'all' || tag3 !== 'all' || provider !== 'all';
        const visibleLetters = new Set();

        document.querySelectorAll('.item').forEach(item => {
            const itemTag1 = item.dataset.tag1;
            const itemTag2 = item.dataset.tag2;
            const itemTag3 = item.dataset.tag3;
            const itemProvider = item.dataset.provider;

            let firstLetter = item.querySelector('.database-name').textContent.charAt(0).toUpperCase();
            if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

            const match =
                (tag1 === 'all' || tag1 === itemTag1) &&
                (tag2 === 'all' || tag2 === itemTag2) &&
                (tag3 === 'all' || tag3 === itemTag3) &&
                (provider === 'all' || provider === itemProvider) &&
                (!selectedLetterFilter || firstLetter === selectedLetterFilter);

            item.style.display = match ? 'flex' : 'none';
            if (match) visibleLetters.add(firstLetter);
        });

        document.querySelectorAll('.letter-section').forEach(section => {
            const anyVisible = Array.from(section.querySelectorAll('.item')).some(
                item => item.style.display !== 'none'
            );
            section.style.display = anyVisible ? 'block' : 'none';
        });

        if (!filteringByLetter) {
            for (let i = 65; i <= 90; i++) {
                const letter = String.fromCharCode(i);
                const btn = alphabetButtons[letter];
                if (btn) btn.disabled = filteringByTagOrProvider ? !visibleLetters.has(letter) : !availableLetters.has(letter);
            }
            const numberBtn = alphabetButtons['#'];
            if (numberBtn) numberBtn.disabled = filteringByTagOrProvider ? !visibleLetters.has('#') : !availableLetters.has('#');
        }

        const visibleItems = Array.from(document.querySelectorAll('.item')).filter(item => item.style.display !== 'none');
        const emptyMessage = document.querySelector('.empty-message');
        emptyMessage.style.display = visibleItems.length ? 'none' : 'flex';

        const countDisplay = document.getElementById('database-count');
        countDisplay.textContent = `${visibleItems.length} database${visibleItems.length === 1 ? '' : 's'} found`;

        clearButton.disabled = !filteringByTagOrProvider && !selectedLetterFilter;
    };

    updateAlphabetButtons = function () {
        document.querySelectorAll('.alphabetFilter button').forEach(btn => btn.classList.remove('active'));
        if (!selectedLetterFilter) allButton.classList.add('active');
        else alphabetButtons[selectedLetterFilter]?.classList.add('active');
    };
}

function createDropdown(label, items, container) {
    const select = document.createElement('select');
    addDropdownOptions(select, label, items);
    container.appendChild(select);
    return select;
}

function addDropdownOptions(select, label, items) {
    select.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = label;
    select.appendChild(defaultOption);
    items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        select.appendChild(opt);
    });
}