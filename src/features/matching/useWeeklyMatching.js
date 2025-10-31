/**
 * useWeeklyMatching.js
 * 
 * Hook personalizado para el nuevo sistema de matching mutuo semanal:
 * - 3-5 matches por semana por usuario
 * - Matching mutuo: si A ve a B, B también ve a A
 * - Sistema semanal en lugar de diario
 * - Estados de matching bidireccional
 */

import { db } from "@/firebaseconfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useWeeklyMatching = (user) => {
  const [weeklyMatches, setWeeklyMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canGetNewMatches, setCanGetNewMatches] = useState(false);
  const [timeUntilNextMatch, setTimeUntilNextMatch] = useState(0);
  const [currentWeekId, setCurrentWeekId] = useState(null);

  // Función helper para limpiar datos antes de guardar en Firebase
  const cleanData = (data) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  // Función para obtener el ID de la semana actual
  const getCurrentWeekId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = getWeekNumber(now);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  // Función para obtener el número de semana
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Función para verificar si puede obtener nuevos matches
  const checkCanGetNewMatches = async () => {
    if (!user?.uid) return false;

    try {
      const weekId = getCurrentWeekId();
      const userMatchesRef = doc(db, 'userWeeklyMatches', `${user.uid}_${weekId}`);
      const userMatchesDoc = await getDoc(userMatchesRef);

      if (!userMatchesDoc.exists()) {
        setCanGetNewMatches(true);
        return true;
      }

      const userMatchesData = userMatchesDoc.data();
      const now = new Date();
      const weekEnd = getWeekEnd(now);
      
      // Si la semana ha terminado, puede obtener nuevos matches
      if (now >= weekEnd) {
        setCanGetNewMatches(true);
        return true;
      }

      setCanGetNewMatches(false);
      return false;
    } catch (error) {
      console.error('Error verificando matches semanales:', error);
      return false;
    }
  };

  // Función para obtener el final de la semana
  const getWeekEnd = (date) => {
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + (7 - date.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  };

  // Función para obtener matches de la semana actual
  const getWeeklyMatches = async () => {
    if (!user?.uid) return;

    try {
      console.log('🔄 Obteniendo matches semanales...');
      setLoading(true);
      const weekId = getCurrentWeekId();
      setCurrentWeekId(weekId);

      // Verificar si ya tiene matches para esta semana
      const userMatchesRef = doc(db, 'userWeeklyMatches', `${user.uid}_${weekId}`);
      const userMatchesDoc = await getDoc(userMatchesRef);

      if (userMatchesDoc.exists()) {
        const userMatchesData = userMatchesDoc.data();
        const matches = userMatchesData.matches || [];
        
        // Sincronizar con el estado real de weeklyMatches
        const updatedMatches = await Promise.all(
          matches.map(async (match) => {
            try {
              const matchRef = doc(db, 'weeklyMatches', match.matchId);
              const matchDoc = await getDoc(matchRef);
              
              if (matchDoc.exists()) {
                const matchData = matchDoc.data();
                const isUser1 = matchData.userId1 === user.uid;
                
                // Determinar el estado real del match
                let status = "pending";
                if (matchData.status === "mutual") {
                  status = "mutual";
                } else if (matchData.user1Accepted && matchData.user2Accepted) {
                  status = "mutual";
                } else if (isUser1 && matchData.user1Accepted) {
                  status = "accepted";
                } else if (!isUser1 && matchData.user2Accepted) {
                  status = "accepted";
                } else if (isUser1 && matchData.user2Accepted) {
                  status = "accepted";
                } else if (!isUser1 && matchData.user1Accepted) {
                  status = "accepted";
                }
                
                // Obtener datos completos del usuario desde userProfiles
                const userProfileRef = doc(db, 'userProfiles', match.matchedUserId);
                const userProfileDoc = await getDoc(userProfileRef);
                
                let matchedUserData = match.matchedUserData;
                if (userProfileDoc.exists()) {
                  const userProfileData = userProfileDoc.data();
                  matchedUserData = {
                    ...matchedUserData,
                    displayName: userProfileData.displayName || matchedUserData.displayName,
                    photoURL: userProfileData.photoURL || matchedUserData.photoURL,
                    age: userProfileData.age || matchedUserData.age,
                    location: userProfileData.location || matchedUserData.location,
                    description: userProfileData.description || matchedUserData.description,
                    hobbies: userProfileData.hobbies || matchedUserData.hobbies || [],
                    email: userProfileData.email || matchedUserData.email
                  };
                }
                
                return { ...match, status, matchedUserData };
              }
              return match;
            } catch (error) {
              console.error('Error sincronizando match:', error);
              return match;
            }
          })
        );
        
        setWeeklyMatches(updatedMatches);
        setLoading(false);
        return;
      }

      // Si no tiene matches, verificar si puede obtenerlos
      const canGet = await checkCanGetNewMatches();
      if (canGet) {
        await generateWeeklyMatches();
      } else {
        setWeeklyMatches([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error obteniendo matches semanales:', error);
      setLoading(false);
    }
  };

  // Función para generar matches semanales
  const generateWeeklyMatches = async () => {
    try {
      console.log("🔄 Generando matches semanales...");
      
      if (!user?.uid) {
        throw new Error("Usuario no autenticado");
      }

      // Obtener todos los usuarios disponibles
      const availableUsersQuery = query(
        collection(db, "userProfiles"),
        where("hasMatchingConsent", "==", true),
        where("matchingEnabled", "==", true),
        where("isPublic", "==", true)
      );

      const availableUsersSnapshot = await getDocs(availableUsersQuery);
      const allUsers = availableUsersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtrar usuarios que no sean el usuario actual
      const otherUsers = allUsers.filter(u => u.id !== user.uid);
      console.log("👥 Usuarios disponibles para matching:", otherUsers.length);

      if (otherUsers.length === 0) {
        console.log("❌ No hay usuarios disponibles para matching");
        setWeeklyMatches([]);
        return;
      }

      // Generar 1-3 matches aleatorios
      const numberOfMatches = Math.min(Math.floor(Math.random() * 3) + 1, otherUsers.length); // 1-3 matches
      const shuffledUsers = [...otherUsers].sort(() => Math.random() - 0.5);
      const selectedUsers = shuffledUsers.slice(0, numberOfMatches);

      console.log(`🎯 Generando ${numberOfMatches} matches para ${user.displayName}`);

      const weekId = getCurrentWeekId();
      const matches = [];

      // Crear matches mutuos
      for (const matchedUser of selectedUsers) {
        const matchId = `${user.uid}_${matchedUser.id}_${weekId}`;
        
        // Crear el match mutuo
        const weeklyMatchData = {
          id: matchId,
          weekId: weekId,
          userId1: user.uid,
          userId2: matchedUser.id,
          user1Data: cleanData({
            displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
            photoURL: user.photoURL,
            email: user.email
          }),
          user2Data: cleanData({
            displayName: matchedUser.displayName,
            photoURL: matchedUser.photoURL,
            age: matchedUser.age,
            location: matchedUser.location,
            description: matchedUser.description,
            hobbies: matchedUser.hobbies || [],
            email: matchedUser.email
          }),
          status: "pending",
          createdAt: serverTimestamp(),
          expiresAt: getWeekEnd(new Date()),
          mutualAt: null
        };

        // Guardar el match en weeklyMatches
        await setDoc(doc(db, 'weeklyMatches', matchId), weeklyMatchData);

        // Crear entrada para el usuario actual
        matches.push({
          matchId: matchId,
          matchedUserId: matchedUser.id,
          matchedUserData: cleanData({
            displayName: matchedUser.displayName,
            photoURL: matchedUser.photoURL,
            age: matchedUser.age,
            location: matchedUser.location,
            description: matchedUser.description,
            hobbies: matchedUser.hobbies || [],
            email: matchedUser.email
          }),
          status: "pending"
        });

        // Crear entrada para el usuario matcheado
        const otherUserMatch = {
          matchId: matchId,
          matchedUserId: user.uid,
          matchedUserData: cleanData({
            displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
            photoURL: user.photoURL,
            age: user.age,
            location: user.location,
            description: user.description,
            hobbies: user.hobbies || [],
            email: user.email
          }),
          status: "pending"
        };

        // Guardar para el usuario matcheado
        const otherUserMatchesRef = doc(db, 'userWeeklyMatches', `${matchedUser.id}_${weekId}`);
        const otherUserMatchesDoc = await getDoc(otherUserMatchesRef);
        
        if (otherUserMatchesDoc.exists()) {
          const existingMatches = otherUserMatchesDoc.data().matches || [];
          await updateDoc(otherUserMatchesRef, {
            matches: [...existingMatches, otherUserMatch],
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(otherUserMatchesRef, {
            userId: matchedUser.id,
            weekId: weekId,
            matches: [otherUserMatch],
            totalMatches: 1,
            createdAt: serverTimestamp()
          });
        }
      }

      // Guardar matches para el usuario actual
      const userMatchesRef = doc(db, 'userWeeklyMatches', `${user.uid}_${weekId}`);
      await setDoc(userMatchesRef, {
        userId: user.uid,
        weekId: weekId,
        matches: matches,
        totalMatches: matches.length,
        createdAt: serverTimestamp()
      });

      setWeeklyMatches(matches);
      setCanGetNewMatches(false);
      
      console.log(`✅ ${matches.length} matches generados exitosamente`);
    } catch (error) {
      console.error('Error generando matches semanales:', error);
      Alert.alert('Error', 'No se pudieron generar los matches. Inténtalo de nuevo.');
    }
  };

  // Función para aceptar un match
  const acceptMatch = async (matchId) => {
    try {
      if (!user?.uid) return false;

      // Actualizar el match en weeklyMatches
      const matchRef = doc(db, 'weeklyMatches', matchId);
      const matchDoc = await getDoc(matchRef);
      
      if (!matchDoc.exists()) {
        console.error('Match no encontrado');
        return false;
      }

      const matchData = matchDoc.data();
      const isUser1 = matchData.userId1 === user.uid;
      
      // Actualizar el estado del match
      const updateData = isUser1 
        ? { user1Accepted: true, user1AcceptedAt: serverTimestamp() }
        : { user2Accepted: true, user2AcceptedAt: serverTimestamp() };

      await updateDoc(matchRef, updateData);

      // Verificar si es mutuo
      const updatedMatchDoc = await getDoc(matchRef);
      const updatedMatchData = updatedMatchDoc.data();
      
      let finalStatus = "accepted";
      if (updatedMatchData.user1Accepted && updatedMatchData.user2Accepted) {
        // Es un match mutuo
        await updateDoc(matchRef, {
          status: "mutual",
          mutualAt: serverTimestamp()
        });
        finalStatus = "mutual";
      }

      // Actualizar en userWeeklyMatches
      const weekId = getCurrentWeekId();
      const userMatchesRef = doc(db, 'userWeeklyMatches', `${user.uid}_${weekId}`);
      const userMatchesDoc = await getDoc(userMatchesRef);
      
      if (userMatchesDoc.exists()) {
        const userMatchesData = userMatchesDoc.data();
        const updatedMatches = userMatchesData.matches.map(match => 
          match.matchId === matchId 
            ? { ...match, status: finalStatus }
            : match
        );
        
        await updateDoc(userMatchesRef, {
          matches: updatedMatches,
          updatedAt: serverTimestamp()
        });
      }

      // Actualizar el estado local
      setWeeklyMatches(prev => 
        prev.map(match => 
          match.matchId === matchId 
            ? { ...match, status: finalStatus }
            : match
        )
      );

      return true;
    } catch (error) {
      console.error('Error aceptando match:', error);
      return false;
    }
  };

  // Función para rechazar un match
  const rejectMatch = async (matchId) => {
    try {
      if (!user?.uid) return false;

      // Actualizar en userWeeklyMatches
      const weekId = getCurrentWeekId();
      const userMatchesRef = doc(db, 'userWeeklyMatches', `${user.uid}_${weekId}`);
      const userMatchesDoc = await getDoc(userMatchesRef);
      
      if (userMatchesDoc.exists()) {
        const userMatchesData = userMatchesDoc.data();
        const updatedMatches = userMatchesData.matches.map(match => 
          match.matchId === matchId 
            ? { ...match, status: "rejected" }
            : match
        );
        
        await updateDoc(userMatchesRef, {
          matches: updatedMatches,
          updatedAt: serverTimestamp()
        });
      }

      // Actualizar el estado local
      setWeeklyMatches(prev => 
        prev.map(match => 
          match.matchId === matchId 
            ? { ...match, status: "rejected" }
            : match
        )
      );

      return true;
    } catch (error) {
      console.error('Error rechazando match:', error);
      return false;
    }
  };

  // Función para obtener el tiempo hasta la próxima semana
  const getTimeUntilNextWeek = () => {
    try {
      console.log('🔄 Calculando tiempo hasta próxima semana...');
      const now = new Date();
      const weekEnd = getWeekEnd(now);
      const timeDiff = Math.max(0, Math.floor((weekEnd.getTime() - now.getTime()) / 1000));
      console.log('⏰ Tiempo hasta próxima semana:', timeDiff, 'segundos');
      setTimeUntilNextMatch(timeDiff);
    } catch (error) {
      console.error('Error calculando tiempo hasta próxima semana:', error);
      setTimeUntilNextMatch(0);
    }
  };

  // Efectos
  useEffect(() => {
    if (user?.uid) {
      console.log('🔄 Inicializando useWeeklyMatching para usuario:', user.uid);
      getWeeklyMatches();
      getTimeUntilNextWeek();
    }
  }, [user?.uid]);

  // useEffect para sincronizar matches cada 30 segundos
  useEffect(() => {
    if (!user?.uid || weeklyMatches.length === 0) return;

    const syncInterval = setInterval(async () => {
      try {
        const weekId = getCurrentWeekId();
        const userMatchesRef = doc(db, 'userWeeklyMatches', `${user.uid}_${weekId}`);
        const userMatchesDoc = await getDoc(userMatchesRef);
        
        if (userMatchesDoc.exists()) {
          const userMatchesData = userMatchesDoc.data();
          const matches = userMatchesData.matches || [];
          
          // Sincronizar con el estado real de weeklyMatches
          const updatedMatches = await Promise.all(
            matches.map(async (match) => {
              try {
                const matchRef = doc(db, 'weeklyMatches', match.matchId);
                const matchDoc = await getDoc(matchRef);
                
                if (matchDoc.exists()) {
                  const matchData = matchDoc.data();
                  const isUser1 = matchData.userId1 === user.uid;
                  
                  // Determinar el estado real del match
                  let status = "pending";
                  if (matchData.status === "mutual") {
                    status = "mutual";
                  } else if (matchData.user1Accepted && matchData.user2Accepted) {
                    status = "mutual";
                  } else if (isUser1 && matchData.user1Accepted) {
                    status = "accepted";
                  } else if (!isUser1 && matchData.user2Accepted) {
                    status = "accepted";
                  } else if (isUser1 && matchData.user2Accepted) {
                    status = "accepted";
                  } else if (!isUser1 && matchData.user1Accepted) {
                    status = "accepted";
                  }
                  
                  // Obtener datos completos del usuario desde userProfiles
                const userProfileRef = doc(db, 'userProfiles', match.matchedUserId);
                const userProfileDoc = await getDoc(userProfileRef);
                
                let matchedUserData = match.matchedUserData;
                if (userProfileDoc.exists()) {
                  const userProfileData = userProfileDoc.data();
                  matchedUserData = {
                    ...matchedUserData,
                    displayName: userProfileData.displayName || matchedUserData.displayName,
                    photoURL: userProfileData.photoURL || matchedUserData.photoURL,
                    age: userProfileData.age || matchedUserData.age,
                    location: userProfileData.location || matchedUserData.location,
                    description: userProfileData.description || matchedUserData.description,
                    hobbies: userProfileData.hobbies || matchedUserData.hobbies || [],
                    email: userProfileData.email || matchedUserData.email
                  };
                }
                
                return { ...match, status, matchedUserData };
                }
                return match;
              } catch (error) {
                console.error('Error sincronizando match:', error);
                return match;
              }
            })
          );
          
          // Solo actualizar si hay cambios
          const hasChanges = updatedMatches.some((match, index) => 
            match.status !== weeklyMatches[index]?.status
          );
          
          if (hasChanges) {
            setWeeklyMatches(updatedMatches);
            console.log('🔄 Matches sincronizados');
          }
        }
      } catch (error) {
        console.error('Error en sincronización automática:', error);
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(syncInterval);
  }, [user?.uid, weeklyMatches.length]);

  // Timer para el tiempo restante
  useEffect(() => {
    let timer;
    if (timeUntilNextMatch > 0) {
      timer = setInterval(() => {
        setTimeUntilNextMatch(prev => {
          if (prev <= 1) {
            setCanGetNewMatches(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeUntilNextMatch]);

  // Función para forzar sincronización
  const syncMatches = async () => {
    if (!user?.uid) return;
    
    try {
      const weekId = getCurrentWeekId();
      const userMatchesRef = doc(db, 'userWeeklyMatches', `${user.uid}_${weekId}`);
      const userMatchesDoc = await getDoc(userMatchesRef);
      
      if (userMatchesDoc.exists()) {
        const userMatchesData = userMatchesDoc.data();
        const matches = userMatchesData.matches || [];
        
        // Sincronizar con el estado real de weeklyMatches
        const updatedMatches = await Promise.all(
          matches.map(async (match) => {
            try {
              const matchRef = doc(db, 'weeklyMatches', match.matchId);
              const matchDoc = await getDoc(matchRef);
              
              if (matchDoc.exists()) {
                const matchData = matchDoc.data();
                const isUser1 = matchData.userId1 === user.uid;
                
                // Determinar el estado real del match
                let status = "pending";
                if (matchData.status === "mutual") {
                  status = "mutual";
                } else if (matchData.user1Accepted && matchData.user2Accepted) {
                  status = "mutual";
                } else if (isUser1 && matchData.user1Accepted) {
                  status = "accepted";
                } else if (!isUser1 && matchData.user2Accepted) {
                  status = "accepted";
                } else if (isUser1 && matchData.user2Accepted) {
                  status = "accepted";
                } else if (!isUser1 && matchData.user1Accepted) {
                  status = "accepted";
                }
                
                // Obtener datos completos del usuario desde userProfiles
                const userProfileRef = doc(db, 'userProfiles', match.matchedUserId);
                const userProfileDoc = await getDoc(userProfileRef);
                
                let matchedUserData = match.matchedUserData;
                if (userProfileDoc.exists()) {
                  const userProfileData = userProfileDoc.data();
                  matchedUserData = {
                    ...matchedUserData,
                    displayName: userProfileData.displayName || matchedUserData.displayName,
                    photoURL: userProfileData.photoURL || matchedUserData.photoURL,
                    age: userProfileData.age || matchedUserData.age,
                    location: userProfileData.location || matchedUserData.location,
                    description: userProfileData.description || matchedUserData.description,
                    hobbies: userProfileData.hobbies || matchedUserData.hobbies || [],
                    email: userProfileData.email || matchedUserData.email
                  };
                }
                
                return { ...match, status, matchedUserData };
              }
              return match;
            } catch (error) {
              console.error('Error sincronizando match:', error);
              return match;
            }
          })
        );
        
        setWeeklyMatches(updatedMatches);
        console.log('🔄 Matches sincronizados manualmente');
      }
    } catch (error) {
      console.error('Error en sincronización manual:', error);
    }
  };

  return {
    weeklyMatches,
    loading,
    canGetNewMatches,
    timeUntilNextMatch,
    currentWeekId,
    getWeeklyMatches,
    generateWeeklyMatches,
    acceptMatch,
    rejectMatch,
    syncMatches
  };
};
