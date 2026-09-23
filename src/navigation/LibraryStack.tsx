import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeContext } from '../theme/ThemeContext';
import { LibraryScreen } from '../screens/LibraryScreen';
import { AllahNamesListScreen } from '../screens/AllahNamesListScreen';

const Stack = createNativeStackNavigator();

function LibraryStack({ hapticEnabled, fontSize }: any) {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right', 
        contentStyle: { backgroundColor: isDarkMode ? '#14110E' : '#EFE7DA' }
      }}
    >
      <Stack.Screen name="LibraryMain">
        {(props) => <LibraryScreen {...props} hapticEnabled={hapticEnabled} fontSize={fontSize} />}
      </Stack.Screen>
      <Stack.Screen name="AllahNamesList" component={AllahNamesListScreen} />
    </Stack.Navigator>
  );
}

export { LibraryStack };
