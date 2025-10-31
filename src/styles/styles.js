import { Colors } from '@/src/constants/Colors';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // 📌 Estilos para identificar posts propios
  myPostCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: '#E3F2FD',
  },
  myPostBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  myPostBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorBadge: {
    marginLeft: 6,
  },
  authorBadgeText: {
    fontSize: 14,
  },
  myPostJoinBtn: {
    backgroundColor: Colors.secondary,
  },
  myPostJoinBtnText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  userBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  userBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickPost: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickPostInput: {
    fontSize: 16,
    color: '#1a202c',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  quickPostBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickPostBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  feed: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textLight,
  },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 14,
    color: Colors.textLight,
  },
  activityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  detailTag: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailTagText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantAvatars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  participantAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  participantCount: {
    fontSize: 14,
    color: Colors.textLight,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  joinBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  commentBtn: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  commentBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  simplePostText: {
    fontSize: 16,
    color: '#1a202c',
    lineHeight: 22,
    marginBottom: 12,
  },
  simplePostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  simpleCommentBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
  },
  simpleCommentBtnText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  createForm: {
    margin: 20,
    backgroundColor: Colors.card,
    borderRadius: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 20,
    textAlign: 'center',
  },
  typeSelector: {
    marginBottom: 20,
  },
  typeOption: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    backgroundColor: Colors.primary, // Azul oscuro por defecto
    borderRadius: 12,
    minWidth: 70,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  typeOptionSelected: {
    backgroundColor: Colors.secondary, // Amarillo/dorado cuando está seleccionado
    borderColor: Colors.secondary,
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: Colors.textLight, // Blanco por defecto
    fontWeight: '500',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    color: '#1a202c',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  imageSelector: {
    marginBottom: 12,
  },
  imageSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
  },
  imageSelectorButton: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#64748b',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelBtnText: {
    color: '#64748b',
    fontWeight: '600',
  },
  createBtn: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // 📌 Estilos para autenticación
  authContainer: {
    flex: 1,
  },
  authGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  authContent: {
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
    textAlign: 'center',
  },
  authForm: {
    width: '100%',
    maxWidth: 320,
  },
  authInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  authButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  authToggle: {
    alignItems: 'center',
    padding: 12,
  },
  authToggleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  
  // 📌 Estilos para comentarios
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseBtn: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
  },
  originalPost: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  originalPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  originalPostAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  originalPostAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
  },
  originalPostTime: {
    fontSize: 12,
    color: '#64748b',
  },
  originalActivityTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalActivityEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  originalActivityTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  originalPostText: {
    fontSize: 16,
    color: '#1a202c',
    lineHeight: 20,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
  },
  commentTime: {
    fontSize: 12,
    color: '#64748b',
  },
  commentText: {
    fontSize: 14,
    color: '#1a202c',
    lineHeight: 18,
  },
  noCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  commentInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: '#1a202c',
    backgroundColor: '#fff',
  },
  sendCommentBtn: {
    marginLeft: 12,
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // 📌 Estilos para el selector de cupos
  participantsSection: {
    marginBottom: 20,
  },
  participantsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 12,
  },
  participantsOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  participantOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    minWidth: 50,
    alignItems: 'center',
  },
  participantOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  participantOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  participantOptionTextSelected: {
    color: '#fff',
  },
  participantsHint: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // 📌 Estilos para filtros y planes destacados
  filtersSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 80,
  },
  filterButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextSelected: {
    color: '#fff',
  },
  featuredSection: {
    backgroundColor: '#f8fafc',
    paddingVertical: 20,
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  featuredPlanCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginRight: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredPlanHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featuredPlanEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  featuredPlanInfo: {
    flex: 1,
  },
  featuredPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 4,
  },
  featuredPlanAuthor: {
    fontSize: 14,
    color: '#64748b',
  },
  featuredPlanBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredPlanBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  featuredPlanDetails: {
    marginBottom: 12,
  },
  featuredPlanDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  featuredPlanParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredPlanParticipantsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  allPlansSection: {
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  // Nuevos estilos para scroll
  scrollableContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  activityCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  // Estilos para administrador
  adminBadge: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },

  // Estilos para selectores de fecha y hora
  dateTimeSection: {
    marginBottom: 12,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 8,
  },
  dateTimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#1a202c',
    flex: 1,
  },
  dateTimeArrow: {
    fontSize: 16,
    marginLeft: 8,
  },

  // Estilos para el modal del selector de hora
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerModal: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    margin: 20,
    maxHeight: '70%',
    minWidth: 280,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  timePickerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerCloseText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  timePickerList: {
    maxHeight: 300,
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  timeOptionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  timeOptionText: {
    fontSize: 16,
    color: Colors.primary,
    flex: 1,
  },
  timeOptionTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  timeOptionCheck: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Estilos para el modal del calendario
  calendarModal: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    margin: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  calendarModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  calendarModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalCloseText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});
