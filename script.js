const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKC0N3BXrvxSnYhKoLtg1AG7QKevRWw6wtglOxOqd5c2yA-4sYm1fa51Q5thYUbNmvuUhgwogaZacG/pub?output=tsv';
fetch(sheetUrl)
    .then(response => response.text())
    .then(csvData => {
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split('\t');

        const container = document.querySelector('.container');
        const filters = new Set();  // To hold unique tags

        // Create items and collect tags
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split('\t');
            const name = parts[0];
            const imageUrl = parts[1];
            const databaseUrl = parts[2];
            const databaseDescriptionText = parts[3];
            const tags = parts.slice(4);

            const div = document.createElement('div');
            div.className = 'item';
            div.dataset.tags = tags.join(',');

            const img = document.createElement('img');
            img.src = imageUrl;
            // div.appendChild(img); --> eventually bring this back because the url for the detail page should be in a description rather than on the image no one will find it otherwise

            const detailLink = document.createElement('a');
            detailLink.href = `detail.html?name=${encodeURIComponent(name)}`;
            detailLink.style.textDecoration = 'none';
            detailLink.appendChild(img);
            div.appendChild(detailLink);

            const databaseLink = document.createElement('a');
            databaseLink.href = databaseUrl;
            databaseLink.textContent = name;
            databaseLink.className = 'database-name';

            const databaseDescription = document.createElement('span');
            databaseDescription.textContent = '– ' + databaseDescriptionText;
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
                    filters.add(cleanTag)
                }
            }
            );

            sortedFilters = Array.from(filters).sort();
        }

        // Dynamically create filter buttons based on unique tags
        const filtersContainer = document.querySelector('.filters');

        // Add a dropdown menu for filters
        const filterDropdown = document.createElement('select');
        filtersContainer.appendChild(filterDropdown);

        // Add an "All" option to the dropdown
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'All';
        filterDropdown.appendChild(allOption);

        // Add options for each filter
        sortedFilters.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            filterDropdown.appendChild(option);
        });

        // Add filter functionality to the dropdown
        filterDropdown.addEventListener('change', () => {
            const selectedFilter = filterDropdown.value;
            document.querySelectorAll('.item').forEach(item => {
                if (selectedFilter === 'all' || item.dataset.tags.includes(selectedFilter)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });

    })
    .catch(error => {
        console.error('Error loading the sheet:', error);
    });