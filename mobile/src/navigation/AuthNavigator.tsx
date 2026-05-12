import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import FoodAddScreen from '../screens/FoodAddScreen';
import FoodListScreen from '../screens/FoodListScreen';
import WeightScreen from '../screens/WeightScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Root: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export type AppTabParamList = {
  Home: undefined;
  FoodAdd: undefined;
  FoodList: undefined;
  Weight: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontSize: 12 },
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { color: '#0f172a' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="FoodAdd"
        component={FoodAddScreen}
        options={{
          title: 'Besin Ekle',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="FoodList"
        component={FoodListScreen}
        options={{
          title: 'Besin Listesi',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Weight"
        component={WeightScreen}
        options={{
          title: 'Kilo Takibi',
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AuthNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="Register" component={RegisterScreen} />
  <Stack.Screen name="Root" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
