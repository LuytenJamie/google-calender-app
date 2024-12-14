
const API_BASE_URL = "/"; // Root URL for backend API

// DOM Elements
const userSpan = document.getElementById("user");
const roleSpan = document.getElementById("role");
const milestonesDiv = document.getElementById("milestones");
const messageDiv = document.getElementById("message");

let userRole = "free";

// Logout Button
document.getElementById("logout").onclick = async () => {
  try {
    const response = await fetch("/auth/logout", { method: "POST" });
    if (response.ok) {
      alert("Logged out successfully!");
      location.reload(); // Refresh the page to reset UI state
    } else {
      alert("Failed to log out. Please try again.");
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("An error occurred while logging out.");
  }
};

// Fetch user info and active role
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

// Fetch milestones
document.getElementById("fetchMilestones").onclick = () =>
  fetchMilestones();

const fetchMilestones = async () => {
  document.getElementById("fetchMilestones").innerHTML =
    "Fetching milestones";
  const milestonesTable = document
    .getElementById("milestones")
    .querySelector("tbody");
  milestonesTable.innerHTML =
    "<tr><td colspan='5' class='center'>Loading milestones...</td></tr>";
  try {
    const response = await fetch(`${API_BASE_URL}milestones`);
    if (!response.ok) throw new Error("Failed to fetch milestones");
    const milestones = await response.json();

    // Clear previous rows
    milestonesTable.innerHTML = "";

    milestones.forEach((milestone) => {
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

    if (milestones.length === 0) {
      milestonesTable.innerHTML =
        "<tr><td colspan='4' class='center'>No milestones found.</td></tr>";
    }

    document.getElementById("fetchMilestones").innerHTML =
      "Refetch milestones";
  } catch (err) {
    console.error(err);
    milestonesTable.innerHTML =
      "<tr><td colspan='4' class='center'>Error fetching milestones</td></tr>";
  }
};

const addToCalendar = async (summary, start, end) => {
  try {
    const response = await fetch(`${API_BASE_URL}calendar/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary, start, end }),
    });

    if (!response.ok) throw new Error("Failed to create event");

    const eventData = await response.json();
    return eventData.htmlLink;
  } catch (err) {
    console.error(err);
    alert("Error creating event");
    throw err;
  }
};

// Initialize
fetchUserInfo();