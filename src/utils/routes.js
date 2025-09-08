import HomeScript from '../scripts/home.js?url';
import NearbyFacilitiesScript from '../scripts/nearby-facilities.js?url';
import AssetSubmissionScript from '../scripts/asset-submission.js?url';
import DashboardScript from '../scripts/dashboard.js?url';

export const ROUTES = {
    '#/': {
        page: '/pages/home.html',
        script: HomeScript
    },
    '#/nearby-facilities': {
        page: '/pages/nearby-facilities.html',
        script: NearbyFacilitiesScript
    },
    '#/asset-submission': {
        page: '/pages/asset-submission.html',
        script: AssetSubmissionScript
    },
    '#/dashboard': {
        page: '/pages/dashboard.html',
        script: DashboardScript
    },
    '#/help': {
        page: '/pages/help.html',
        script: ''
    },
    '#/faq': {
        page: '/pages/faq.html',
        script: ''
    },
}