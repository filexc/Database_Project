const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';

// Global state variables
let allItemsData = [];
let selectedLetterFilter = null;
let applyFilters;
let updateAlphabetButtonsActive;

// Dropdown elements
let tag1Dropdown, tagDropdown, tag3Dropdown, providerDropdown;

fetch(sheetUrl)
    .then(response => response.text())
    .then(csvData => processSheetData(csvData))
    .catch(error => console.error('Error loading the sheet:', error));

function cleanTag(tag) {
    if (!tag) return '';
    return tag.trim().replace(/^\s*[xX]/, '').replace(/\s+/g, ' ').replace(/\u00A0/g, ' ');
}

function processSheetData(csvData) {
    const lines = csvData.trim().split('\n');
    const providerFilters = new Set();

    for (let i = 1; i < lines.length; i++) {
        const entry = parseLine(lines[i]);
        allItemsData.push(entry);
        if (entry.provider) providerFilters.add(entry.provider);
    }

    createAllItemsAndSections();
    createFilterControls(Array.from(providerFilters).sort());
    applyFilters(); // Initial display
}

function parseLine(line) {
    const parts = line.split('\t');
    const name = parts[0] || '';
    const provider = parts[1] || '';
    const imageUrl = parts[2] || '';
    const databaseUrl = parts[3] || '';
    const databaseDescriptionText = parts[4] || '';
    const tag1 = cleanTag(parts[5]);
    const tags = parts.slice(6).map(cleanTag).filter(Boolean); // Clean and filter empty tags

    let firstLetter = name.trim().charAt(0).toUpperCase();
    if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';

    return { name, provider, imageUrl, databaseUrl, databaseDescriptionText, tag1, tags, firstLetter };
}

function createAllItemsAndSections() {
    const container = document.querySelector('.container');
    const sectionMap = {};

    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No results match your filters.';
    emptyMessage.style.display = 'none';
    container.appendChild(emptyMessage);

    allItemsData.forEach(entry => {
        const item = createItem(entry);
        if (!sectionMap[entry.firstLetter]) {
            sectionMap[entry.firstLetter] = [];
        }
        sectionMap[entry.firstLetter].push(item);
    });

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

function createItem(entry) {
    const div = document.createElement('div');
    div.className = 'item';
    // Store data on the element for filtering
    div.dataset.provider = entry.provider;
    div.dataset.tag1 = entry.tag1;
    div.dataset.tags = entry.tags.join(',');
    div.dataset.name = entry.name;

    const logoFrame = document.createElement('div');
    logoFrame.className = 'logo-frame';
    const img = document.createElement('img');
    img.src = entry.imageUrl;
    logoFrame.appendChild(img);
    div.appendChild(logoFrame);

    const nameAndDescription = document.createElement('div');
    nameAndDescription.className = 'text-block';

    const databaseLink = document.createElement('a');
    databaseLink.href = entry.databaseUrl;
    let p = entry.provider ? ` (${entry.provider})` : '';
    databaseLink.textContent = entry.name + p;
    databaseLink.target = '_blank';
    databaseLink.className = 'database-name';

    const databaseDescription = document.createElement('span');
    databaseDescription.textContent = ` - ${entry.databaseDescriptionText}`;
    databaseDescription.className = 'description';

    nameAndDescription.appendChild(databaseLink);
    nameAndDescription.appendChild(databaseDescription);
    
    const allDisplayTags = [entry.tag1, ...entry.tags].filter(Boolean);
    if (allDisplayTags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';

        // Tag1 Button
        if (entry.tag1) {
            const tag1Button = createTagButton(entry.tag1, true);
            tag1Button.addEventListener('click', () => {
                tag1Dropdown.value = entry.tag1;
                updateSecondDropdown();
                applyFilters();
            });
            tagsContainer.appendChild(tag1Button);
        }

        // Other Tags Buttons
        entry.tags.forEach(tag => {
            const tagButton = createTagButton(tag, false);
            tagButton.addEventListener('click', () => {
                tag1Dropdown.value = entry.tag1 || 'all';
                updateSecondDropdown();
                tagDropdown.value = tag;
                updateThirdDropdown();
                applyFilters();
            });
            tagsContainer.appendChild(tagButton);
        });
        
        nameAndDescription.appendChild(tagsContainer);
    }
    
    div.appendChild(nameAndDescription);
    return div;
}

function createTagButton(tag, isPrimary) {
    const tagButton = document.createElement('span');
    tagButton.textContent = tag;
    tagButton.className = 'tag-label';
    if (isPrimary) {
        tagButton.style.backgroundColor = '#cce5ff';
        tagButton.style.color = '#004085';
    }
    return tagButton;
}

function createFilterControls(providers) {
    const primaryTags = [...new Set(allItemsData.map(item => item.tag1).filter(Boolean))].sort();

    tag1Dropdown = createDropdown('All Primary Tags', primaryTags, document.querySelector('.tag1Filters'));
    tagDropdown = createDropdown('All Tags', [], document.querySelector('.tagFilters'));
    tag3Dropdown = createDropdown('All Tags', [], document.querySelector('.tag3Filters'));
    providerDropdown = createDropdown('All Providers', providers, document.querySelector('.providerFilters'));

    createAlphabetFilter();

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Filters';
    clearButton.className = 'clear-button';
    document.querySelector('.filterBar').appendChild(clearButton);
    
    // --- Event Listeners ---
    tag1Dropdown.addEventListener('change', () => {
        selectedLetterFilter = null;
        // Reset lower-level dropdowns
        tagDropdown.value = 'all'; // Reset Tag 2
        tag3Dropdown.value = 'all'; // Reset Tag 3
        updateSecondDropdown(); // This will also handle visibility of Tag 2 and Tag 3 containers
        applyFilters();
    });

    tagDropdown.addEventListener('change', () => {
        selectedLetterFilter = null;
        // Reset lower-level dropdown
        tag3Dropdown.value = 'all'; // Reset Tag 3
        updateThirdDropdown(); // This will also handle visibility of Tag 3 container
        applyFilters();
    });

    tag3Dropdown.addEventListener('change', () => {
        selectedLetterFilter = null;
        applyFilters();
    });

    providerDropdown.addEventListener('change', () => {
        selectedLetterFilter = null;
        applyFilters();
    });
    
    clearButton.addEventListener('click', () => {
        tag1Dropdown.value = 'all';
        providerDropdown.value = 'all';
        selectedLetterFilter = null;
        updateSecondDropdown(); // This will hide and reset the other dropdowns
        applyFilters();
    });
}

function updateSecondDropdown() {
    const selectedTag1 = tag1Dropdown.value;
    const tag2Container = document.querySelector('.tagFilters');

    if (selectedTag1 === 'all') {
        tag2Container.style.display = 'none';
        populateDropdown(tagDropdown, [], 'All Tags');
    } else {
        const itemsWithTag1 = allItemsData.filter(item => item.tag1 === selectedTag1);
        const secondaryTags = [...new Set(itemsWithTag1.flatMap(item => item.tags))].sort();
        
        populateDropdown(tagDropdown, secondaryTags, 'All Tags');
        tag2Container.style.display = secondaryTags.length > 0 ? 'block' : 'none';
    }
    // Always update the third dropdown after the second one changes
    updateThirdDropdown();
}

function updateThirdDropdown() {
    const selectedTag1 = tag1Dropdown.value;
    const selectedTag2 = tagDropdown.value;
    const tag3Container = document.querySelector('.tag3Filters');

    if (selectedTag1 === 'all' || selectedTag2 === 'all') {
        tag3Container.style.display = 'none';
        populateDropdown(tag3Dropdown, [], 'All Tags');
    } else {
        const itemsWithTag1And2 = allItemsData.filter(item => 
            item.tag1 === selectedTag1 && item.tags.includes(selectedTag2)
        );
        const tertiaryTags = [...new Set(
            itemsWithTag1And2.flatMap(item => item.tags).filter(tag => tag !== selectedTag2)
        )].sort();

        populateDropdown(tag3Dropdown, tertiaryTags, 'All Tags');
        tag3Container.style.display = tertiaryTags.length > 0 ? 'block' : 'none';
    }
}

applyFilters = function() {
    const selectedTag1 = tag1Dropdown.value;
    const selectedTag2 = tagDropdown.value;
    const selectedTag3 = tag3Dropdown.value;
    const selectedProvider = providerDropdown.value;

    const anyFilterActive = selectedTag1 !== 'all' || selectedProvider !== 'all' || !!selectedLetterFilter;
    document.querySelector('.clear-button').disabled = !anyFilterActive;
    
    let visibleCount = 0;
    const visibleLetters = new Set();

    document.querySelectorAll('.item').forEach(item => {
        const itemTags = item.dataset.tags.split(',');
        
        const matchesTag1 = selectedTag1 === 'all' || item.dataset.tag1 === selectedTag1;
        const matchesTag2 = selectedTag2 === 'all' || itemTags.includes(selectedTag2);
        const matchesTag3 = selectedTag3 === 'all' || itemTags.includes(selectedTag3);
        const matchesProvider = selectedProvider === 'all' || item.dataset.provider === selectedProvider;

        let firstLetter = item.dataset.name.charAt(0).toUpperCase();
        if (!firstLetter.match(/[A-Z]/)) firstLetter = '#';
        const matchesLetter = !selectedLetterFilter || firstLetter === selectedLetterFilter;

        const visible = matchesTag1 && matchesTag2 && matchesTag3 && matchesProvider && matchesLetter;
        
        item.style.display = visible ? 'flex' : 'none';
        if (visible) {
            visibleCount++;
            visibleLetters.add(firstLetter);
        }
    });

    document.querySelectorAll('.letter-section').forEach(section => {
        const hasVisible = Array.from(section.querySelectorAll('.item')).some(
            item => item.style.display !== 'none'
        );
        section.style.display = hasVisible ? 'block' : 'none';
    });
    
    updateAlphabetButtonsState(visibleLetters);
    updateAlphabetButtonsActive();

    document.querySelector('.empty-message').style.display = visibleCount === 0 ? 'block' : 'none';
    document.getElementById('database-count').textContent = `${visibleCount} database${visibleCount === 1 ? '' : 's'} found`;
};


function populateDropdown(selectElement, items, defaultText) {
    const currentValue = selectElement.value;
    selectElement.innerHTML = ''; // Clear existing options

    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = defaultText;
    selectElement.appendChild(defaultOption);

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        selectElement.appendChild(option);
    });

    // Restore previous value if it still exists in the new options
    if (Array.from(selectElement.options).some(opt => opt.value === currentValue)) {
        selectElement.value = currentValue;
    }
}

function createDropdown(defaultText, items, container) {
    const select = document.createElement('select');
    populateDropdown(select, items, defaultText);
    container.appendChild(select);
    return select;
}

// --- Alphabet Filter Functions ---
let alphabetButtons = {};
function createAlphabetFilter() {
    const alphabetContainer = document.querySelector('.alphabetFilter');
    const availableLetters = new Set(allItemsData.map(item => item.firstLetter));

    const allButton = document.createElement('button');
    allButton.textContent = 'All';
    allButton.addEventListener('click', () => {
        selectedLetterFilter = null;
        applyFilters();
    });
    alphabetContainer.appendChild(allButton);

    const alphabet = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];
    alphabet.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.disabled = !availableLetters.has(letter);
        button.addEventListener('click', () => {
            selectedLetterFilter = letter;
            applyFilters();
        });
        alphabetButtons[letter] = button;
        alphabetContainer.appendChild(button);
    });
}

function updateAlphabetButtonsState(visibleLetters) {
    const filteringByTagsOrProvider = tag1Dropdown.value !== 'all' || providerDropdown.value !== 'all';
    const availableLetters = new Set(allItemsData.map(item => item.firstLetter));

    for (const letter in alphabetButtons) {
        const btn = alphabetButtons[letter];
        if (filteringByTagsOrProvider) {
            btn.disabled = !visibleLetters.has(letter);
        } else {
            btn.disabled = !availableLetters.has(letter);
        }
    }
}

updateAlphabetButtonsActive = function() {
    document.querySelectorAll('.alphabetFilter button').forEach(btn => btn.classList.remove('active'));
    if (selectedLetterFilter) {
        alphabetButtons[selectedLetterFilter]?.classList.add('active');
    } else {
        document.querySelector('.alphabetFilter button').classList.add('active'); // 'All' button
    }
};