const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getActiveUser } = require('../utils/activeUsers');

exports.getMilestones = async (req, res) => {
    const authToken = req.cookies.auth;

    if (!authToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(authToken, process.env.SESSION_SECRET);
    const userEmail = decoded.email;
    const userData = getActiveUser(userEmail);

    if (!userData || !userData.githubAccessToken) {
        return res.status(403).json({ error: 'GitHub access token missing' });
    }

    try {
        const { data: repos } = await axios.get(`https://api.github.com/user/repos`, {
            headers: {
              Authorization: `Bearer ${userData.githubAccessToken}`,
              Accept: "application/json",
            },
          });
        
        const reposWithMilestones = repos.reduce((acc, curr) => {
            acc.push({
                html_url: curr.html_url,
                name: curr.full_name,
                private: curr.private,
                milestones_url: curr.milestones_url,
                milestones: []
            });
            return acc;
        }, []);
        
        const updatedRepos = await Promise.all(
            reposWithMilestones.map(async (repo) => {
                const updatedRepo = await getMilestonesForRepo(repo, userData.githubAccessToken);
                return updatedRepo;
            })
        );

        res.json(updatedRepos);
    } catch (error) {
        console.error('Error fetching milestones:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch milestones' });
    }
};

const getMilestonesForRepo = async (repo, githubAccessToken) => {
    try {
        const { data: milestones } = await axios.get(
            repo.milestones_url.replace(/{\/number}$/, ""),
            {
                headers: { Authorization: `Bearer ${githubAccessToken}` },
            }
        );

        repo.milestones.push(...milestones);
    } catch (error) {
        console.error(`Error fetching milestones for repo: ${repo.name}`, error.message);
    }
    return repo;
}