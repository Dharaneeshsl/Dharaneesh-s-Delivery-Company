import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/user.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;

  // Getters
  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;

  // API base URL
  static const String baseUrl = 'http://localhost:3000/api';

  AuthProvider() {
    _loadStoredAuth();
  }

  // Load stored authentication data
  Future<void> _loadStoredAuth() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedToken = prefs.getString('auth_token');
      final storedUser = prefs.getString('user_data');

      if (storedToken != null && storedUser != null) {
        _token = storedToken;
        _user = User.fromJson(json.decode(storedUser));
        notifyListeners();
      }
    } catch (e) {
      print('Error loading stored auth: $e');
    }
  }

  // Store authentication data
  Future<void> _storeAuth(String token, User user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
      await prefs.setString('user_data', json.encode(user.toJson()));
    } catch (e) {
      print('Error storing auth: $e');
    }
  }

  // Clear stored authentication data
  Future<void> _clearStoredAuth() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_data');
    } catch (e) {
      print('Error clearing stored auth: $e');
    }
  }

  // Register user
  Future<bool> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String role,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
          'role': role,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 201) {
        _user = User.fromJson(data['user']);
        _token = data['token'];
        await _storeAuth(_token!, _user!);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(data['error'] ?? 'Registration failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Login user
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _user = User.fromJson(data['user']);
        _token = data['token'];
        await _storeAuth(_token!, _user!);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(data['error'] ?? 'Login failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Get user profile
  Future<bool> getProfile() async {
    if (_token == null) return false;

    _setLoading(true);
    _clearError();

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/profile'),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _user = User.fromJson(data['user']);
        await _storeAuth(_token!, _user!);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(data['error'] ?? 'Failed to get profile');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Update user profile
  Future<bool> updateProfile({
    String? name,
    String? phone,
  }) async {
    if (_token == null) return false;

    _setLoading(true);
    _clearError();

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/auth/profile'),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          if (name != null) 'name': name,
          if (phone != null) 'phone': phone,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _user = User.fromJson(data['user']);
        await _storeAuth(_token!, _user!);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(data['error'] ?? 'Failed to update profile');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Change password
  Future<bool> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (_token == null) return false;

    _setLoading(true);
    _clearError();

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/auth/change-password'),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _setLoading(false);
        return true;
      } else {
        _setError(data['error'] ?? 'Failed to change password');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Forgot password
  Future<bool> forgotPassword(String email) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/forgot-password'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'email': email,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _setLoading(false);
        return true;
      } else {
        _setError(data['error'] ?? 'Failed to send reset email');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Reset password
  Future<bool> resetPassword({
    required String resetToken,
    required String newPassword,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/reset-password'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'resetToken': resetToken,
          'newPassword': newPassword,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        _setLoading(false);
        return true;
      } else {
        _setError(data['error'] ?? 'Failed to reset password');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Network error: $e');
      _setLoading(false);
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    _setLoading(true);

    try {
      if (_token != null) {
        await http.post(
          Uri.parse('$baseUrl/auth/logout'),
          headers: {
            'Authorization': 'Bearer $_token',
            'Content-Type': 'application/json',
          },
        );
      }
    } catch (e) {
      print('Logout error: $e');
    }

    _user = null;
    _token = null;
    await _clearStoredAuth();
    _setLoading(false);
    notifyListeners();
  }

  // Helper methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  // Get HTTP headers with authentication
  Map<String, String> get authHeaders => {
    'Authorization': 'Bearer $_token',
    'Content-Type': 'application/json',
  };
} 