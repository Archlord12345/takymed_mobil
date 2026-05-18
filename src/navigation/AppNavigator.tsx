import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Home, LayoutDashboard, Pill, FileText, User, Bell, Sparkles } from 'lucide-react-native';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PrescriptionScreen from '../screens/PrescriptionScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrdonnancesScreen from '../screens/OrdonnancesScreen';
import AdsScreen from '../screens/AdsScreen';
import UpgradeScreen from '../screens/UpgradeScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import PharmacyMgmtScreen from '../screens/PharmacyMgmtScreen';
import CommercialDashboardScreen from '../screens/CommercialDashboardScreen';
import CommercialRegisterScreen from '../screens/CommercialRegisterScreen';
import { Colors } from '../utils/Theme';

// Screens
...
function MainTabs() {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const isCommercial = user?.type === 'commercial';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '800',
          color: Colors.foreground,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={isCommercial ? CommercialDashboardScreen : DashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          title: isCommercial ? 'Commercial' : 'Tableau de bord',
          headerShown: true
        }}
      />
      {!isCommercial && (
        <Tab.Screen 
          name="Prescriptions" 
          component={OrdonnancesScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
            title: 'Ordonnances',
            headerShown: true
          }}
        />
      )}
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Pill color={color} size={size} />,
          title: 'Pharmacies',
          headerShown: true
        }}
      />
      <Tab.Screen 
        name="News" 
        component={AdsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
          title: 'Actualités',
          headerShown: true
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          title: 'Mon Profil',
          headerShown: true
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="AddPrescription" component={PrescriptionScreen} />
            <Stack.Screen name="Upgrade" component={UpgradeScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="PharmacyMgmt" component={PharmacyMgmtScreen} />
            <Stack.Screen name="CommercialRegister" component={CommercialRegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
