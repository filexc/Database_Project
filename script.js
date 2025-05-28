const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';

fetch(sheetUrl)
    .then(response => response.text())
    .then(csvData => processSheetData(csvData))
    .catch(error => console.error('Error loading the sheet:', error));

function processSheetData(csvData) {
    const lines = csvData.trim().split('\n');

    const container = document.querySelector('.container');
    const tagFilters = new Set();
    const tag1Filter = new Set();
    const providerFilters = new Set();
    const sectionMap = {};

    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No results match your filters.';
    emptyMessage.style.display = 'none';
    container.appendChild(emptyMessage);

    for (let i = 1; i < lines.length; i++) {
        const entry = parseLine(lines[i]);
        addToFilters(entry, tag1Filter, tagFilters, providerFilters);
        const item = createItem(entry);

        if (!sectionMap[entry.firstLetter]) {
            sectionMap[entry.firstLetter] = [];
        }
        sectionMap[entry.firstLetter].push(item);
    }

    createLetterSections(sectionMap, container);
    const { sortedTag1Filters, sortedTagFilters, sortedProviderFilters } = sortFilters(tag1Filter, tagFilters, providerFilters);
    createFilterControls(sortedTag1Filters, sortedTagFilters, sortedProviderFilters);

    applyFilters();
}

function parseLine(line) {
    const parts = line.split('\t');
    const name = parts[0];
    const provider = parts[1];
    const imageUrl = parts[2];
    const databaseUrl = parts[3];
    const databaseDescriptionText = parts[4];
    const tag1 = parts[5];
    const tags = parts.slice(6);

    let firstLetter = name.trim().charAt(0).toUpperCase();
    if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

    return { name, provider, imageUrl, databaseUrl, databaseDescriptionText, tag1, tags, firstLetter };
}

function addToFilters(entry, tag1Filter, tagFilters, providerFilters) {
    if (entry.provider) providerFilters.add(entry.provider);
    const cleanTag1 = entry.tag1.trim().replace(/^\s*[xX]/, '').replace(/\s+/g, ' ').replace(/\u00A0/g, ' ');
    if (cleanTag1) tag1Filter.add(cleanTag1);
    entry.tags.forEach(tag => {
        // Clean tag: trim, remove leading 'x' or 'X', collapse spaces, ignore blanks
        const cleanTag = tag.trim().replace(/^\s*[xX]/, '').replace(/\s+/g, ' ').replace(/\u00A0/g, ' ');
        if (cleanTag) tagFilters.add(cleanTag);
    });
}

// Global filter state & functions accessible for item tag click handlers
let selectedLetterFilter = null;
let applyFilters;
let updateAlphabetButtons;

function createItem(entry) {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.tags = entry.tags.join(',');
    div.dataset.provider = entry.provider;
    div.dataset.tag1 = entry.tag1.trim().replace(/^\s*[xX]/, '').replace(/\s+/g, ' ').replace(/\u00A0/g, ' ');

    const logoFrame = document.createElement('div');
    logoFrame.className = 'logo-frame';
    const img = document.createElement('img');
    img.src = entry.imageUrl;
    logoFrame.appendChild(img);
    div.appendChild(logoFrame);

    const nameAndDescription = document.createElement('div');
    nameAndDescription.className = 'text-block';
    nameAndDescription.style.whiteSpace = 'normal';

    const databaseLink = document.createElement('a');
    databaseLink.href = entry.databaseUrl;
    let p = entry.provider != '' ? ' (' + entry.provider + ')' : '';
    databaseLink.textContent = entry.name + p;
    databaseLink.target = '_blank';
    databaseLink.className = 'database-name';

    const databaseDescription = document.createElement('span');
    databaseDescription.textContent = ' - ' + entry.databaseDescriptionText;
    databaseDescription.style.fontSize = '0.9em';
    databaseDescription.className = 'description';

    nameAndDescription.appendChild(databaseLink);
    nameAndDescription.appendChild(databaseDescription);

    // Create a container for tags on the line below
    if (entry.tags.some(tag => tag.trim() !== '')) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        tagsContainer.style.marginTop = '4px';

        if (entry.tag1.trim() !== '') {
            const cleanTag1 = entry.tag1.trim().replace(/^[xX]/, '');
            const tag1Button = document.createElement('span');
            tag1Button.textContent = cleanTag1;
            tag1Button.className = 'tag-label';
            tag1Button.style.backgroundColor = '#cce5ff';  // Light blue to distinguish it
            tag1Button.style.borderRadius = '4px';
            tag1Button.style.padding = '2px 6px';
            tag1Button.style.marginRight = '6px';
            tag1Button.style.fontSize = '0.9em';
            tag1Button.style.color = '#004085';
    
            tag1Button.addEventListener('click', () => {
                const tag1Dropdown = document.querySelector('.tag1Filters select');
                if (tag1Dropdown) {
                    tag1Dropdown.value = cleanTag1;
                    selectedLetterFilter = null;
                    updateAlphabetButtons();
                    applyFilters();
                }
            });
    
            tagsContainer.appendChild(tag1Button);
        }

        entry.tags
            .map(tag => tag.trim())
            .filter(tag => tag !== '')
            .forEach(tag => {
                const cleanTag = tag.replace(/^[xX]/, '');

                const tagButton = document.createElement('span');
                tagButton.textContent = cleanTag;
                tagButton.className = 'tag-label';
                tagButton.style.backgroundColor = '#ddd';
                tagButton.style.borderRadius = '4px';
                tagButton.style.padding = '2px 6px';
                tagButton.style.marginRight = '6px';
                tagButton.style.fontSize = '0.9em';
                tagButton.style.color = '#666';

                tagButton.addEventListener('click', () => {
                    const tagDropdown = document.querySelector('.tagFilters select');
                    if (tagDropdown) {
                        tagDropdown.value = cleanTag;
                        selectedLetterFilter = null;
                        updateAlphabetButtons();
                        applyFilters();
                    }
                });

                tagsContainer.appendChild(tagButton);
            });

        nameAndDescription.appendChild(tagsContainer);
    }

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

function sortFilters(tag1Filters, tagFilters, providerFilters) {
    return {
        sortedTag1Filters: Array.from(tag1Filters).sort(),
        sortedTagFilters: Array.from(tagFilters).sort(),
        sortedProviderFilters: Array.from(providerFilters).sort()
    };
}

function createFilterControls(tag1s, tags, providers) {
    const tag1FiltersContainer = document.querySelector('.tag1Filters')
    const tagFiltersContainer = document.querySelector('.tagFilters');
    const providerFiltersContainer = document.querySelector('.providerFilters');

    const tag1Dropdown = createDropdown('All Primary Tags', tag1s, tag1FiltersContainer);
    const tagDropdown = createDropdown('All Tags', tags, tagFiltersContainer);
    const providerDropdown = createDropdown('All Providers', providers, providerFiltersContainer);

    const emptyMessage = document.querySelector('.empty-message');

    const alphabetContainer = document.querySelector('.alphabetFilter');
    const alphabetButtons = {};
    const availableLetters = new Set();

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Filters';
    clearButton.className = 'clear-button';
    clearButton.disabled = true;
    document.querySelector('.filterBar').appendChild(clearButton);

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

    applyFilters = function () {
        const selectedTag1 = tag1Dropdown.value;
        const selectedTag = tagDropdown.value;
        const selectedProvider = providerDropdown.value;

        const filteringByTagOrProvider = selectedTag1 !== 'all' || selectedTag !== 'all' || selectedProvider !== 'all';
        const filteringByLetter = !!selectedLetterFilter;
        const visibleLetters = new Set();

        document.querySelectorAll('.item').forEach(item => {
            const nameText = item.querySelector('.database-name').textContent.trim();
            let firstLetter = nameText.charAt(0).toUpperCase();
            if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

            const tagsArray = item.dataset.tags.split(',').map(t => t.trim());
            const cleanedTagsArray = tagsArray.map(t => t.replace(/^\s*[xX]/, ''));

            const matchesTag = selectedTag === 'all' || cleanedTagsArray.includes(selectedTag);
            const matchesTag1 = selectedTag1 === 'all' || item.dataset.tag1 === selectedTag1;
            const matchesProvider = selectedProvider === 'all' || item.dataset.provider == selectedProvider;
            const matchesLetter = !selectedLetterFilter || firstLetter === selectedLetterFilter;

            const visible = matchesTag1 && matchesTag && matchesProvider && matchesLetter;

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

        const allItems = document.querySelectorAll('.item');
        const visibleItems = Array.from(allItems).filter(item => item.style.display !== 'none');

        const hasTagFilter = tag1Dropdown.value !== 'all' || tagDropdown.value !== 'all';
        const hasProviderFilter = providerDropdown.value !== 'all';
        const hasLetterFilter = !!selectedLetterFilter;
        const anyFilterActive = hasTagFilter || hasProviderFilter || hasLetterFilter;

        clearButton.disabled = !anyFilterActive;

        emptyMessage.style.display = visibleItems.length === 0 ? 'flex' : 'none';

        const countDisplay = document.getElementById('database-count');
        if (countDisplay) {
            countDisplay.textContent = `${visibleItems.length} database${visibleItems.length === 1 ? '' : 's'} found`;
        }
    };

    updateAlphabetButtons = function () {
        document.querySelectorAll('.alphabetFilter button').forEach(btn => btn.classList.remove('active'));
        if (!selectedLetterFilter) {
            allButton.classList.add('active');
        } else {
            alphabetButtons[selectedLetterFilter]?.classList.add('active');
        }
    };

    tag1Dropdown.addEventListener('change', () => {
        selectedLetterFilter = null;
        updateAlphabetButtons();
        applyFilters();
    });
    
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

    clearButton.addEventListener('click', () => {
        tag1Dropdown.value = 'all';
        tagDropdown.value = 'all';
        providerDropdown.value = 'all';
        selectedLetterFilter = null;
        updateAlphabetButtons();
        applyFilters();
    });
}

function createDropdown(defaultText, items, container) {
    const select = document.createElement('select');

    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = defaultText;
    select.appendChild(defaultOption);

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });

    container.appendChild(select);
    return select;
}