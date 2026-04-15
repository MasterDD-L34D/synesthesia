// controllers/creator.controller.js
import EntryService from '../services/entry.service.js';
import ZenService from '../services/zen.service.js';

class CreatorController {
    constructor(entryService, zenService) {
        this.entryService = entryService;
        this.zenService = zenService;
    }

    async renderCreatorDashboard(req, res, next) {
        const creatorId = req.user.id;
        const creatorEnneagramType = req.user.profile?.dominant_type;

        try {
            const userEntries = await this.entryService.getCreatorEntriesWithStats(creatorId);
            const stats = await this.entryService.getCreatorAggregateStats(creatorId);

            // Fase 10 — se il creator non ha ancora task e ha un tipo dominante,
            // genera 3 task e le persiste in recommended_tasks. Successivi reload
            // useranno quelle persistenti invece di rigenerare al volo.
            let personalizedTasks = await this.zenService.getRecommendedTasks(creatorId);
            if (personalizedTasks.length === 0 && creatorEnneagramType) {
                const candidates = await this.zenService.generatePersonalizedTasks(
                    creatorEnneagramType
                );
                for (const content of candidates.slice(0, 3)) {
                    await this.zenService.saveRecommendedTask(creatorId, content);
                }
                personalizedTasks = await this.zenService.getRecommendedTasks(creatorId);
            }

            res.render('pages/creator-dashboard', {
                title: 'Dashboard Creator',
                user: req.user,
                entries: userEntries,
                stats,
                personalizedTasks,
                creatorEnneagramType,
            });
        } catch (error) {
            console.error('Error rendering creator dashboard:', error);
            next(error);
        }
    }
}

export default CreatorController;