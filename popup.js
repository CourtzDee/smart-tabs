document.addEventListener("DOMContentLoaded", function () {
    chrome.tabs.query({}, function(tabs) {
        const categories = {
            "AI & Tech": ["ai", "chatgpt", "openai", "machine learning", "perplexity"],
            "Shopping": ["amazon", "cart", "ebay", "price", "shop"],
            "Social": ["facebook", "twitter", "instagram", "tiktok", "reddit"],
            "Entertainment": ["youtube", "netflix", "stream", "hulu", "music"],
            "Coding": ["github", "stack overflow", "code", "dev", "programming"]
        };

        // Dark Mode Toggle
        const toggle = document.getElementById("darkModeToggle");
        const body = document.body;

        //Toast Helper Function

        function showToast(message) {
            const toast = document.getElementById("toast");
            toast.textContent = message;
            toast.style.display = "block";
            toast.style.opacity = 1;
            setTimeout(() => {
                toast.style.opacity = 0;
                setTimeout(() => {
                    toast.style.display = "none";
                }, 300);
            }, 2500);
            }

        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            toggle.checked = true;
            body.classList.remove("light");
            body.classList.add("dark");
        } else {
            body.classList.add("light");
        }

        toggle.addEventListener("change", function () {
            if (toggle.checked) {
                body.classList.remove("light");
                body.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                body.classList.remove("dark");
                body.classList.add("light");
                localStorage.setItem("theme", "light");
            }
        });

        // Group Tabs
        let groupedTabs = {};
        let urlMap = {};

        tabs.forEach(tab => {
            let title = tab.title.toLowerCase();
            let url = tab.url.toLowerCase();

            urlMap[url] = (urlMap[url] || 0) + 1;

            let matchedCategory = "Other";
            for (let category in categories) {
                if (categories[category].some(keyword => title.includes(keyword) || url.includes(keyword))) {
                    matchedCategory = category;
                    break;
                }
            }

            if (!groupedTabs[matchedCategory]) {
                groupedTabs[matchedCategory] = [];
            }
            groupedTabs[matchedCategory].push(tab);
        });

        // Display Tabs
        let list = document.getElementById("tabs-list");
        list.innerHTML = "";

        for (let category in groupedTabs) {
            let header = document.createElement("h3");
            header.textContent = category;
            list.appendChild(header);

            groupedTabs[category].forEach(tab => {
                let li = document.createElement("li");
                let link = document.createElement("a");
                link.href = "#";

                let url = tab.url.toLowerCase();
                let isDuplicate = urlMap[url] > 1;
                link.textContent = tab.title + (isDuplicate ? " (duplicate)" : "");
                link.style.textDecoration = "none";
                link.style.color = "#007bff";
                link.style.cursor = "pointer";

                link.addEventListener("click", function () {
                    chrome.windows.update(tab.windowId, { focused: true }, () => {
                        setTimeout(() => {
                            chrome.tabs.update(tab.id, { active: true });
                        }, 100);
                    });
                });

                li.appendChild(link);
                list.appendChild(li);
            });
        }

        // Close Duplicates Button
        document.getElementById("closeDuplicatesBTN").addEventListener("click", function () {
            chrome.tabs.query({}, function(tabs) {
                let seen = new Set();
                let duplicates = [];
                tabs.forEach(tab => {
                    let url = tab.url.toLowerCase();
                    if (seen.has(url)) {
                        duplicates.push(tab.id);
                    } else {
                        seen.add(url);
                    }
                });
        
                if (duplicates.length > 0) {
                    chrome.tabs.remove(duplicates, () => {
                        showToast(`✅ Closed ${duplicates.length} duplicate tab${duplicates.length > 1 ? "s" : ""}`);
                    });
                } else {
                    showToast("🎉 No duplicate tabs found!");
                }
            });
        });
    });
});
