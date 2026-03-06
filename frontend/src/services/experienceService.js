import api from './api';

/**
 * Experience service for kiosk operations
 */
const experienceService = {
  /**
   * Record entry
   * @param {Object} data - Entry data
   * @returns {Promise} Entry result
   */
  async recordEntry(data) {
    const response = await api.post('/experiences/entry', data);
    return response.data;
  },

  /**
   * Record exit
   * @param {number} userId - User ID
   * @returns {Promise} Exit result
   */
  async recordExit(userId) {
    const response = await api.put(`/experiences/${userId}/exit`);
    return response.data;
  },

  /**
   * Get today's stats
   * @returns {Promise} Today's statistics
   */
  async getTodayStats() {
    const response = await api.get('/experiences/today');
    return response.data;
  },

  /**
   * Get experience logs
   * @param {Object} params - Query parameters
   * @returns {Promise} Experience logs
   */
  async getExperienceLogs(params = {}) {
    const response = await api.get('/experiences', { params });
    return response.data;
  },

  /**
   * Get experience detail
   * @param {number} id - Experience ID
   * @returns {Promise} Experience detail
   */
  async getExperienceDetail(id) {
    const response = await api.get(`/experiences/${id}`);
    return response.data;
  }
};

export default experienceService;