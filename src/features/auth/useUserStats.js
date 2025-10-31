/**
 * useUserStats.js
 * 
 * Hook personalizado que obtiene estadísticas del usuario:
 * - Posts creados
 * - Actividades inscritas
 * - Comentarios realizados
 * - Estadísticas generales
 */

import {
    collection,
    onSnapshot,
    query,
    where
} from "firebase/firestore";
import { useEffect, useState } from 'react';
import { db } from "@/firebaseconfig";

export const useUserStats = (user) => {
  const [userStats, setUserStats] = useState({
    posts: 0,
    activities: 0,
    comments: 0,
    participations: 0
  });
  const [loading, setLoading] = useState(true);
  const [myParticipations, setMyParticipations] = useState([]);

  // Obtener estadísticas del usuario
  useEffect(() => {
    if (!user) {
      setUserStats({ posts: 0, activities: 0, comments: 0, participations: 0 });
      setMyParticipations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("📊 Obteniendo estadísticas para usuario:", user.uid);

    // 1. Escuchar posts del usuario
    const postsQuery = query(
      collection(db, "posts"),
      where("authorId", "==", user.uid)
    );

    const postsUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const stats = {
        posts: posts.filter(p => p.type === "simple").length,
        activities: posts.filter(p => p.type === "activity").length,
        comments: posts.filter(p => p.type === "comment").length,
        participations: userStats.participations
      };

      setUserStats(stats);
      console.log("📊 Posts del usuario:", stats);
    });

    // 2. Escuchar participaciones del usuario
    const participationsQuery = query(
      collection(db, "participations"),
      where("userId", "==", user.uid)
    );

    const participationsUnsubscribe = onSnapshot(participationsQuery, (snapshot) => {
      const participations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMyParticipations(participations);
      setUserStats(prev => ({
        ...prev,
        participations: participations.length
      }));
      
      console.log("📊 Participaciones del usuario:", participations.length);
      setLoading(false);
    });

    return () => {
      postsUnsubscribe();
      participationsUnsubscribe();
    };
  }, [user]);

  // Obtener actividades inscritas con detalles
  const getMyActivities = () => {
    return myParticipations.map(participation => ({
      id: participation.id,
      postId: participation.postId,
      activityTitle: participation.activityTitle,
      activityDate: participation.activityDate,
      activityLocation: participation.activityLocation,
      activityEmoji: participation.activityEmoji,
      status: participation.status,
      createdAt: participation.createdAt
    }));
  };

  return {
    userStats,
    myParticipations: getMyActivities(),
    loading
  };
}; 