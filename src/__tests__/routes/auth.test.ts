import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/authRoutes';

// Mock pour passport
jest.mock('passport', () => ({
  authenticate: jest.fn().mockImplementation(() => (req: any, res: any, next: any) => next()),
}));

// Mock pour les contrôleurs d'authentification
jest.mock('../../controllers/authController', () => ({
  getAuthStatus: jest
    .fn()
    .mockImplementation((req, res) => res.json({ success: true, isAuthenticated: false })),
  getAuthUrls: jest.fn().mockImplementation((req, res) =>
    res.json({
      github: 'http://localhost:3000/auth/github',
      google: 'http://localhost:3000/auth/google',
    })
  ),
  logout: jest.fn().mockImplementation((req, res) => res.redirect('/')),
}));

/**
 * Tests d'intégration pour les routes d'authentification
 * @group integration
 * @group routes
 */
describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/auth', authRoutes);
  });

  /**
   * @test
   * @description Vérifie que la route /auth/status retourne le statut d'authentification
   */
  it("devrait retourner le statut d'authentification", async () => {
    const response = await request(app).get('/auth/status');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      isAuthenticated: false,
    });
  });

  /**
   * @test
   * @description Vérifie que la route /auth/urls retourne les URLs d'authentification
   */
  it("devrait retourner les URLs d'authentification", async () => {
    const response = await request(app).get('/auth/urls');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      github: 'http://localhost:3000/auth/github',
      google: 'http://localhost:3000/auth/google',
    });
  });

  /**
   * @test
   * @description Vérifie que la route /auth/logout déconnecte l'utilisateur
   */
  it("devrait déconnecter l'utilisateur", async () => {
    const response = await request(app).get('/auth/logout');
    expect(response.status).toBe(302); // Redirection
  });
});
