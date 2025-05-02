import { Request, Response } from 'express';
import * as authController from '../../controllers/authController';

/**
 * Tests pour le contrôleur d'authentification
 * @group unit
 * @group controllers
 */
describe('Auth Controller', () => {
  // @ts-ignore - On ignore les erreurs de type pour les mocks
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    responseObject = {
      statusCode: 0,
      jsonObject: {},
      redirectUrl: '',
    };

    // @ts-ignore - On utilise des mocks simplifiés
    mockRequest = {
      isAuthenticated: () => false,
      user: undefined,
    };

    mockResponse = {
      status: jest.fn().mockImplementation(code => {
        responseObject.statusCode = code;
        return mockResponse;
      }),
      json: jest.fn().mockImplementation(data => {
        responseObject.jsonObject = data;
        return mockResponse;
      }),
      redirect: jest.fn().mockImplementation(url => {
        responseObject.redirectUrl = url;
        return mockResponse;
      }),
      send: jest.fn().mockReturnThis(),
    };
  });

  /**
   * @test
   * @description Vérifie que le statut d'authentification renvoie false pour un utilisateur non authentifié
   */
  describe('getAuthStatus', () => {
    it('renvoie isAuthenticated: false quand non authentifié', () => {
      // Act
      authController.getAuthStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(responseObject.jsonObject).toEqual({
        success: true,
        isAuthenticated: false,
      });
    });

    it('renvoie isAuthenticated: true et les données utilisateur quand authentifié', () => {
      // Arrange
      const mockUser = { id: 'user123', provider: 'github' };
      // @ts-ignore
      mockRequest.isAuthenticated = () => true;
      mockRequest.user = mockUser;

      // Act
      authController.getAuthStatus(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(responseObject.jsonObject).toEqual({
        success: true,
        isAuthenticated: true,
        user: mockUser,
      });
    });
  });

  /**
   * @test
   * @description Vérifie que logout déconnecte l'utilisateur
   */
  describe('logout', () => {
    it("déconnecte l'utilisateur et redirige vers la page d'accueil", () => {
      // @ts-ignore
      mockRequest.logout = jest.fn().mockImplementation(callback => callback(null));
      process.env.FRONTEND_URL = 'http://test.com';

      // Act
      authController.logout(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRequest.logout).toHaveBeenCalled();
      expect(responseObject.redirectUrl).toBe('http://test.com');
    });

    it('renvoie une erreur 500 si la déconnexion échoue', () => {
      // Arrange
      const mockError = new Error('Logout failed');
      // @ts-ignore
      mockRequest.logout = jest.fn().mockImplementation(callback => callback(mockError));

      // Act
      authController.logout(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRequest.logout).toHaveBeenCalled();
      expect(responseObject.statusCode).toBe(500);
      expect(responseObject.jsonObject).toEqual({
        success: false,
        message: 'Error during logout',
        error: 'Logout failed',
      });
    });
  });
});
