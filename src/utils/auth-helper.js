/**
 * Authentication helper utilities
 */

// Family member credentials from environment variables
const FAMILY_CREDENTIALS = {
  'admin@familyholdings.local': {
    password: 'WillSawyer2024!',
    userId: '5e98e9eb-375b-49f6-82bc-904df30c4021',
    name: 'Will Sawyer',
    role: 'admin'
  },
  'thomas@familyholdings.local': {
    password: 'ThomasSawyer2024!',
    userId: '6813d815-53cc-4d08-8bf5-8df09e8a7650',
    name: 'Thomas Sawyer',
    role: 'member'
  },
  'evelyn@familyholdings.local': {
    password: 'EvelynSawyer2024!',
    userId: 'a00a1129-eabe-4e82-afa4-0a6136313cd2',
    name: 'Evelyn Sawyer',
    role: 'member'
  },
  'theo@familyholdings.local': {
    password: 'TheoSawyer2024!',
    userId: '0155517a-6406-4cea-9425-990e32820803',
    name: 'Theo Sawyer',
    role: 'member'
  }
};

/**
 * Normalize role values for consistency
 * @param {string} role 
 * @returns {string}
 */
function normalizeRole(role) {
  // Map 'user' to 'member' for consistency across the application
  return role === 'user' ? 'member' : role;
}

/**
 * Validate user credentials and return user data
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function validateCredentials(email, password) {
  // Simulate API delay for realistic UX
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const credentials = FAMILY_CREDENTIALS[email];
  
  if (!credentials || credentials.password !== password) {
    return {
      success: false,
      error: 'Invalid email or password'
    };
  }
  
  // Fetch user data from the backend to ensure we have the latest role and profile info
  try {
    const response = await fetch(`http://localhost:8000/users/${credentials.userId}`, {
      headers: {
        'x-user-id': credentials.userId,
        'x-user-role': credentials.role,
        'x-user-email': email
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const userData = await response.json();
    
    // Normalize the role from backend
    const normalizedRole = normalizeRole(userData.role || credentials.role);
    
    return {
      success: true,
      user: {
        id: credentials.userId,
        email: email,
        name: userData.full_name || credentials.name,
        role: normalizedRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name || credentials.name)}&background=${normalizedRole === 'admin' ? 'dc2626' : '6d28d9'}&color=fff`
      }
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // Fallback to credential data if backend is unavailable
    const normalizedRole = normalizeRole(credentials.role);
    
    return {
      success: true,
      user: {
        id: credentials.userId,
        email: email,
        name: credentials.name,
        role: normalizedRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.name)}&background=${normalizedRole === 'admin' ? 'dc2626' : '6d28d9'}&color=fff`
      }
    };
  }
}

/**
 * Check if user has admin privileges
 * @param {object} user 
 * @returns {boolean}
 */
export function isAdmin(user) {
  return user?.role === 'admin';
}

/**
 * Check if user can access admin features
 * @param {object} user 
 * @returns {boolean}
 */
export function canAccessAdminFeatures(user) {
  return isAdmin(user);
}

/**
 * Check if user can manage other users
 * @param {object} user 
 * @returns {boolean}
 */
export function canManageUsers(user) {
  return isAdmin(user);
}

/**
 * Check if user can view all family data
 * @param {object} user 
 * @returns {boolean}
 */
export function canViewAllFamilyData(user) {
  return isAdmin(user);
}

/**
 * Check if user can only access their own data
 * @param {object} user 
 * @returns {boolean}
 */
export function canOnlyAccessOwnData(user) {
  return normalizeRole(user?.role) === 'member';
}

/**
 * Get available features for user based on role
 * @param {object} user 
 * @returns {object}
 */
export function getUserFeatures(user) {
  const baseFeatures = {
    viewDashboard: true,
    viewOwnContributions: true,
    viewOwnLoans: true,
    submitLoanRequests: true,
    updateOwnProfile: true
  };
  
  if (isAdmin(user)) {
    return {
      ...baseFeatures,
      viewAllUsers: true,
      manageUsers: true,
      viewAllContributions: true,
      viewAllLoans: true,
      approveLoanRequests: true,
      manageContributions: true,
      viewFamilyStats: true,
      updateUserBorrowingLimits: true,
      viewFamilyOverview: true,
      manageFamilyOverview: true
    };
  }
  
  return {
    ...baseFeatures,
    viewFamilyOverview: true // Members can view family overview but not manage it
  };
}
