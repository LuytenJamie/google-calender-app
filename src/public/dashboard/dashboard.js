
const API_BASE_URL = "/";

const userSpan = document.getElementById("user");
const roleSpan = document.getElementById("role");
const milestonesDiv = document.getElementById("milestones");
const messageDiv = document.getElementById("message");

let userRole = "free";

const logout = async () => {
  try {
    const response = await fetch("/auth/logout", { method: "POST" });
    if (response.ok) {
      alert("Logged out successfully!");
      location.reload();
    } else {
      alert("Failed to log out. Please try again.");
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("An error occurred while logging out.");
  }
};

document.getElementById("logout").onclick = () => logout();


document.getElementById("linkGithub").onclick = async () => {
  try {
    window.location.href = "/auth/github";
  } catch (err) {
    console.error("GitHub linking error:", err);
    alert("An error occurred while linking your GitHub account.");
  }
}

const fetchUserInfo = async () => {
  try {
    const response = await fetch("/auth/me");
    if (!response.ok) throw new Error("Not authenticated");
    const userInfo = await response.json();
    userSpan.innerText = userInfo.name || "Unknown";
    roleSpan.innerText = userInfo.role || "Unknown";
    userRole = userInfo.role;
    fetchMilestones();
  } catch (err) {
    console.error(err);
    userSpan.innerText = "Not logged in";
    roleSpan.innerText = "N/A";
  }
};

const isGithubAuthenticated = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}auth/github/check`);
    if (!response.ok) throw new Error("Not authenticated with GitHub");
    document.getElementById("repositories").style.display = "block";
    document.getElementById("fetchMilestones").style.display = "block";
    document.getElementById("githubAuth").style.display = "none";
    return true;
  } catch (err) {
    console.error(err);
    document.getElementById("fetchMilestones").style.display = "none";
    document.getElementById("repositories").style.display = "none";
    document.getElementById("githubAuth").style.display = "block";
    return false;
  }
};

document.getElementById("fetchMilestones").onclick = () =>
  fetchMilestones();

const fetchMilestones = async () => {
  const authenticated = await isGithubAuthenticated();
  if (!authenticated) return;
  
  document.getElementById("fetchMilestones").innerHTML = "Fetching milestones";
  const repositoriesContainer = document.getElementById("repositories");
  repositoriesContainer.innerHTML = "<p>Loading repositories...</p>";

  try {
    const response = await fetch(`${API_BASE_URL}milestones`);
    if (!response.ok) throw new Error("Failed to fetch repositories");
    const repositories = await response.json();

    repositoriesContainer.innerHTML = "";

    repositories.filter(repo => repo.milestones.length > 0).forEach((repository) => {
      const accordionItem = document.createElement("div");
      accordionItem.classList.add("accordion-item");

      const accordionContent = document.createElement("div");
      accordionContent.classList.add("accordion-content");
      accordionContent.style.display = "none";
      
      const accordionHeader = document.createElement("button");
      accordionHeader.classList.add("accordion-header");
      accordionHeader.textContent = repository.name;
      accordionHeader.onclick = () => toggleAccordion(accordionContent);
      
      accordionItem.appendChild(accordionHeader);
      
      if (repository.milestones.length === 0) {
        accordionContent.innerHTML = "<p>No milestones found.</p>";
      } else {
        const milestonesTable = document.createElement("table");
        const tableHeader = document.createElement("thead");
        const headerRow = document.createElement("tr");

        const headerCreator = document.createElement("th");
        headerCreator.textContent = "Creator";
        const headerTitle = document.createElement("th");
        headerTitle.textContent = "Title";
        const headerDescription = document.createElement("th");
        headerDescription.textContent = "Description";
        const headerDueDate = document.createElement("th");
        headerDueDate.textContent = "Due Date";
        const headerActions = document.createElement("th");
        headerActions.textContent = "Actions";
        headerRow.appendChild(headerCreator);
        headerRow.appendChild(headerTitle);
        headerRow.appendChild(headerDescription);
        headerRow.appendChild(headerDueDate);
        headerRow.appendChild(headerActions);
        tableHeader.appendChild(headerRow);
        milestonesTable.setAttribute("id", "milestones")
        milestonesTable.appendChild(tableHeader);

        repository.milestones.forEach((milestone) => {
            const row = document.createElement("tr");
      
            // Creator
            const creatorCell = document.createElement("td");
            creatorCell.classList.add("creator-cell");
            const creatorLink = document.createElement("a");
            creatorLink.href = milestone.creator.html_url;
            creatorLink.target = "_blank";
            creatorLink.title = milestone.creator.login;
      
            const avatar = document.createElement("img");
            avatar.src = milestone.creator.avatar_url;
            avatar.alt = milestone.creator.login;
            avatar.className = "avatar";
      
            creatorLink.appendChild(avatar);
            creatorCell.appendChild(creatorLink);
            creatorCell.appendChild(
              document.createTextNode(` ${milestone.creator.login}`)
            );
            row.appendChild(creatorCell);
      
            // Title
            const titleCell = document.createElement("td");
            titleCell.textContent = milestone.title;
            row.appendChild(titleCell);
      
            // Description
            const descriptionCell = document.createElement("td");
            descriptionCell.textContent =
              milestone.description || "No description provided";
            row.appendChild(descriptionCell);
      
            // Due Date
            const dueDateCell = document.createElement("td");
            dueDateCell.textContent =
              new Date(milestone.due_on).toLocaleString() || "No due date";
            row.appendChild(dueDateCell);
      
            // Add to Calendar Button
            const addToCalendarCell = document.createElement("td");
            const addToCalendarBtn = document.createElement("button");
            addToCalendarBtn.innerText = "Add to calendar";
            if(userRole === "free") {
              addToCalendarBtn.disabled = true;
              addToCalendarBtn.innerText = "Disabled";
              addToCalendarBtn.style.backgroundColor = "orange";
              addToCalendarBtn.style.cursor = "not-allowed";
            } else {
              addToCalendarBtn.onclick = async (e) => {
                e.preventDefault();
                await addToCalendar(
                  milestone.title,
                  milestone.due_on,
                  milestone.due_on
                )
                  .then((htmlLink) => {
                    e.target.innerText = "View event";
                    e.target.onclick = () => window.open(htmlLink, "_blank");
                    e.target.style.backgroundColor = "green";
                  })
                  .catch(() => {
                    e.target.innerText = "Error";
                    e.target.style.backgroundColor = "red";
                  });
              };
            }
            addToCalendarCell.appendChild(addToCalendarBtn);
            row.appendChild(addToCalendarCell);
      
            milestonesTable.appendChild(row);
          });
          accordionContent.appendChild(milestonesTable);
        }
        accordionItem.appendChild(accordionContent);
        repositoriesContainer.appendChild(accordionItem);
      });

    document.getElementById("fetchMilestones").innerHTML = "Refetch milestones";
  } catch (err) {
    console.error(err);
    repositoriesContainer.innerHTML = "<p>Error fetching repositories</p>";
  }
};

const toggleAccordion = (content) => {
  const allContents = document.querySelectorAll('.accordion-content');
  
  allContents.forEach((otherContent) => {
    if (otherContent !== content) {
      otherContent.style.display = "none";
    }
  });

  const isVisible = content.style.display === "block";
  content.style.display = isVisible ? "none" : "block";
};

fetchMilestones();

const addToCalendar = async (summary, start, end) => {
  try {
    const response = await fetch(`${API_BASE_URL}calendar/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, start, end }),
    });

    if (response.status === 401) logout();
    if (!response.ok) throw new Error("Failed to create event");

    const eventData = await response.json();
    return eventData.htmlLink;
  } catch (err) {
    console.error(err);
    alert("Error creating event");
    throw err;
  }
};

fetchUserInfo();