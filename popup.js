document.addEventListener("DOMContentLoaded", function () {
    chrome.tabs.query({}, function(tabs) {
        const categories = {
            "AI & Tech": ["ai", "chatgpt", "openai", "machine learning", "perplexity"],
            "Shopping": ["amazon", "cart", "ebay", "price", "shop"],
            "Social": ["facebook", "twitter", "instagram", "tiktok", "reddit"],
            "Entertainment": ["youtube", "netflix", "stream", "hulu", "music"],
            "Coding": ["github", "stack overflow", "code", "dev", "programming"]
          };

          //Dark Mode Toggle Added

        const toggle = document.getElementById("darkModeToggle");
        const body = document.body;

        //Saved Mode

        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            toggle.checked = true;
            body.classList.remove ("light");
            body.classList.add ("dark");
        } else {
            body.classList.add("light")
        
        }

        //Toggle switch listener

        toggle.addEventListener("change", function () {
            if(toggle.checked) {
                body.classList.remove("light");
                body.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                body.classList.remove("dark");
                body.classList.add ("light");
                localStorage.setItem("theme", "light");
        
            
            }
        })


        //Group Tabs
        
        let groupedTabs = {}

        tabs.forEach(tab => {
            let title = tab.title.toLowerCase ();
            let url = tab.url.toLowerCase ();

            let matchedCategory ="Other"; //Other if group not found

            for (let category in categories) {
                if (categories[category].some(keyword => title.includes(keyword) || url.includes(keyword))){
                    matchedCategory = category;
                    break;
                }
            }
            
            if (!groupedTabs[matchedCategory]) {
                groupedTabs[matchedCategory] = [];
            }
            groupedTabs[matchedCategory].push(tab);

        })
        //Displaying the grouped tabs

        let list = document.getElementById("tabs-list");
        list.innerHTML = "";

        for (let category in groupedTabs) {
            let header = document.createElement ("h3");
            header.textContent = category;
            list.appendChild (header);

        groupedTabs[category].forEach (tab => {
            let li = document.createElement ("li");
            let link =document.createElement("a");
            link.href = "#";
            link.textContent = tab.title;
            link.style.textDecoration = "none";
            link.style.color = "007bff"
            link.style.cursor = "pointer"
            
            //Switch to tab on execute
            link.addEventListener("click", function () {
                // First, bring the window into focus
                chrome.windows.update(tab.windowId, { focused: true }, () => {
                    // Then, after a short delay, activate the tab
                    setTimeout(() => {
                        chrome.tabs.update(tab.id, { active: true });
                    }, 100);
                });
            });
            li.appendChild(link);
            list.appendChild (li); 
        })
        }
        
      
    })
})

