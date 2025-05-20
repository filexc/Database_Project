const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';
fetch(sheetUrl)
    .then(response => response.text())
    .then(csvData => {
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split('\t');

        const container = document.querySelector('.container');
        const tagFilters = new Set();  // To hold unique tags
        const providerFilters = new Set();

        // Create items and collect tags
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split('\t');
            const name = parts[0];
            const provider = parts[1];
            const imageUrl = parts[2];
            const databaseUrl = parts[3];
            const databaseDescriptionText = parts[4];
            const tags = parts.slice(5);

            const div = document.createElement('div');
            div.className = 'item';
            div.dataset.tags = tags.join(',');
            div.dataset.provider = provider;

            const logoFrame = document.createElement('div');
            logoFrame.className = 'logo-frame';

            const img = document.createElement('img');
            img.src = imageUrl;
            logoFrame.appendChild(img);
            // div.appendChild(img); --> eventually bring this back because the url for the detail page should be in a description rather than on the image no one will find it otherwise

            const detailLink = document.createElement('a');
            detailLink.href = `detail.html?name=${encodeURIComponent(name)}`;
            detailLink.style.textDecoration = 'none';
            detailLink.appendChild(logoFrame);
            div.appendChild(detailLink);

            const databaseLink = document.createElement('a');
            databaseLink.href = databaseUrl;
            p = provider != '' ? ' (' + provider + ')' : '';
            databaseLink.textContent = name + p;
            databaseLink.setAttribute('target', '\_blank');
            databaseLink.className = 'database-name';

            if (provider != '') {
                providerFilters.add(provider);
            }

            const databaseDescription = document.createElement('span');
            databaseDescription.textContent = '- ' + databaseDescriptionText;
            databaseDescription.style.fontSize = '0.9em';
            databaseDescription.className = 'description';

            const nameAndDescription = document.createElement('div');
            nameAndDescription.className = 'text-block';
            nameAndDescription.style.display = 'inline';
            nameAndDescription.style.whiteSpace = 'normal';

            nameAndDescription.appendChild(databaseLink);
            nameAndDescription.appendChild(databaseDescription);
            div.appendChild(nameAndDescription)

            container.appendChild(div);

            // Add tags to the filters Set (avoiding duplicates)
            tags.forEach(tag => {
                const cleanTag = tag.trim()
                    .replace(/\s+/g, ' ')           // collapse multiple spaces
                    .replace(/\u00A0/g, ' ')        // replace non-breaking spaces; 
                if (cleanTag != "") {
                    tagFilters.add(cleanTag)
                }
            }
            );

            sortedTagFilters = Array.from(tagFilters).sort();
            sortedProviderFilters = Array.from(providerFilters).sort();
        }

        // Dynamically create filter buttons based on unique tags
        const tagFiltersContainer = document.querySelector('.tagFilters');
        const providerFiltersContainer = document.querySelector('.providerFilters');

        // Add a dropdown menu for filters
        const tagFilterDropdown = document.createElement('select');
        tagFiltersContainer.appendChild(tagFilterDropdown);
        const providerFilterDropdown = document.createElement('select');
        providerFiltersContainer.appendChild(providerFilterDropdown);

        // Add an "All" option to the dropdown
        const tagAllOption = document.createElement('option');
        tagAllOption.value = 'all';
        tagAllOption.textContent = 'All Tags';
        tagFilterDropdown.appendChild(tagAllOption);
        const providerAllOption = document.createElement('option');
        providerAllOption.value = 'all';
        providerAllOption.textContent = 'All Providers';
        providerFilterDropdown.appendChild(providerAllOption);

        // Add options for each filter
        sortedTagFilters.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagFilterDropdown.appendChild(option);
        });

        sortedProviderFilters.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider;
            option.textContent = provider;
            providerFilterDropdown.appendChild(option);
        });

        const alphabetContainer = document.querySelector('.alphabetFilter');
        const alphabetButtons = {};
        const availableLetters = new Set();

        document.querySelectorAll('.item').forEach(item => {
            const firstLetter = item.querySelector('.database-name').textContent.trim().charAt(0).toUpperCase();
            if (firstLetter.match(/[A-Z]/)) {
                availableLetters.add(firstLetter);
            }
        });

        const allLetterButton = document.createElement('button');
        allLetterButton.textContent = 'All';
        allLetterButton.classList.add('active');
        allLetterButton.addEventListener('click', () => {
            selectedLetterFilter = null;
            updateAlphabetButtons();
            applyFilters();
        });
        alphabetContainer.appendChild(allLetterButton);

        let selectedLetterFilter = null;

        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            const button = document.createElement('button');
            button.textContent = letter;

            if (!availableLetters.has(letter)) {
                button.disabled = true;
            }

            button.addEventListener('click', () => {
                selectedLetterFilter = letter;
                updateAlphabetButtons();
                applyFilters();
            });

            alphabetButtons[letter] = button;
            alphabetContainer.appendChild(button);
        }

        // Add filter functionality to the dropdown
        tagFilterDropdown.addEventListener('change', () => {
            selectedLetterFilter = null;
            updateAlphabetButtons();
            applyFilters();
        });

        // Add filter functionality to the dropdown
        providerFilterDropdown.addEventListener('change', () => {
            selectedLetterFilter = null;
            updateAlphabetButtons();
            applyFilters();
        });

        function applyFilters() {
            const selectedTagFilter = tagFilterDropdown.value;
            const selectedProviderFilter = providerFilterDropdown.value;
        
            const filteringByTagOrProvider = 
                selectedTagFilter !== 'all' || selectedProviderFilter !== 'all';
        
            const filteringByLetter = !!selectedLetterFilter;
        
            const visibleFirstLetters = new Set();
        
            document.querySelectorAll('.item').forEach(item => {
                const nameText = item.querySelector('.database-name').textContent.trim();
                const firstLetter = nameText.charAt(0).toUpperCase();
        
                const matchesTag = selectedTagFilter == 'all' || item.dataset.tags.includes(selectedTagFilter);
                const matchesProvider = selectedProviderFilter === 'all' || item.dataset.provider == selectedProviderFilter;
                const matchesLetter = !selectedLetterFilter || firstLetter === selectedLetterFilter;
        
                if (matchesTag && matchesProvider && matchesLetter) {
                    item.style.display = 'flex';
                    visibleFirstLetters.add(firstLetter);
                } else {
                    item.style.display = 'none';
                }
            });
        
            if (!filteringByLetter) {
                for (let i = 65; i <= 90; i++) {
                    const letter = String.fromCharCode(i);
                    const btn = alphabetButtons[letter];
                    if (!btn) continue;
        
                    if (filteringByTagOrProvider) {
                        btn.disabled = !visibleFirstLetters.has(letter);
                    } else {
                        btn.disabled = !availableLetters.has(letter);
                    }
                }
            }
        }
        
        

        function updateAlphabetButtons() {
            document.querySelectorAll('.alphabetFilter button').forEach(btn => btn.classList.remove('active'));
            if (!selectedLetterFilter) {
                allLetterButton.classList.add('active');
            } else {
                alphabetButtons[selectedLetterFilter]?.classList.add('active');
            }
        }

    })
    .catch(error => {
        console.error('Error loading the sheet:', error);
    });

