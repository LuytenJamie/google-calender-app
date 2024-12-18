const axios = require('axios');

exports.getMilestones = async (req, res) => {
    const githubToken = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO; 

    try {
        const { data: milestones } = await axios.get(
            `https://api.github.com/repos/${repo}/milestones`,
            {
                headers: { Authorization: `Bearer ${githubToken}` },
            }
        );

        res.json(milestones);
    } catch (error) {
        console.error('GitHub API Error:', error);
        res.status(500).send('Failed to fetch milestones');
    }
};
