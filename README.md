# my-first-idea
# Nextstep — Student Job Finder
## Original Idea
I wanted to create a browser-based job finder for students and recent graduates. Users enter their skills, interests, preferred location, and experience level to explore job opportunities ranked by how closely they match those preferences. When someone enters their preferences and clicks “Find my matches,” the experience should show a reordered list of job opportunities and let them explore each role’s details.
## How to Run
Open https://nextstep-campus-matches.ql2609.chatgpt.site/ in your browser. No installation is required.
1. Enter your skills, interests, preferred location, and experience level.
2. Click Find my matches to see jobs ranked by your preferences.
3. Click View opportunity to see a job’s details.
4. Click View original job page to visit the employer’s posting.
## AI Tool and Selected Prompts
I used Codex to help build this project. Selected prompts from my process: Build a job-search tool for college students and recent graduates. Users could enter their skills, interests, location, and experience level, and the tool would recommend suitable jobs. When someone click the find, it should update the most suitable jobs. And 我需要debugging，when someone 点击某一个job 的时候，the experience should有job的原始网址按钮，并且给的工作数量需要至少是近期的1000个。
## Reflection
My original goal was to help users quickly find recent, relevant job opportunities from multiple sources. During my first test, I entered “Design” under “Your skills,” selected “Education” under “What interests you?”, entered “New York” as the location, and selected “Entry level.” I expected to see hundreds of recent design-related jobs in education, but only eight results appeared, and I could not open the original job postings. This did not fully match my intention because there were few opportunities to explore and no way to read the complete requirements or learn more about the companies. I asked Codex to add an original posting button to each job’s details and expand the catalog to at least 1,000 recent listings. After the revision, I tested again and found over 1,400 listings in the overall catalog, along with a working “View original job page” button. However, a larger catalog did not mean that every listing matched my preferences. 

AI helped me create the initial project and fix problems, but I still needed to decide who the tool was for, how the interaction should work, and whether the results were useful. This process taught me that more results do not necessarily mean better matches. One unresolved limitation is that the suggested jobs do not always closely match the skills and interests I enter. If I continued developing the project, I would add options for desired job title, internship or full-time work, and remote or on-site work in the “Tell us about you” section. I would also distinguish between requirements that jobs must meet and preferences that only affect their ranking. Finally, I would test several different profiles to check whether the results meet the selected location, field, and experience requirements, focusing on match quality rather than simply increasing the number of listings.
