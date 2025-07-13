import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dharaneesh_delivery/providers/auth_provider.dart';
import 'package:dharaneesh_delivery/providers/delivery_provider.dart';
import 'package:dharaneesh_delivery/screens/splash_screen.dart';
import 'package:dharaneesh_delivery/utils/theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DeliveryProvider()),
      ],
      child: MaterialApp(
        title: "Dharaneesh's Delivery",
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const SplashScreen(),
      ),
    );
  }
} 