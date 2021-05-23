import Talk from 'talkjs';

let loadedPopups: Talk.Popup[] = [];

export const appId = 't6rbhbrZ';
type User = API.Employee;

export async function createTalkUser(user: User): Promise<Talk.User> {
  await Talk.ready;

  return new Talk.User({
    id: `${user.id}`,
    name: `${user.first_name} ${user.last_name}`,
    photoUrl: user.avatar,
    // configuration: 'demo_default',
    // welcomeMessage: 'Hello...',
  });
}

export async function getOrCreateConversation(
  session: Talk.Session,
  currentUser: User,
  otherUser: User,
) {
  const currentTalkUser = await createTalkUser(currentUser);
  const otherTalkUser = await createTalkUser(otherUser);

  const conversationBuilder = session.getOrCreateConversation(
    Talk.oneOnOneId(currentTalkUser, otherTalkUser),
  );
  conversationBuilder.setParticipant(currentTalkUser);
  conversationBuilder.setParticipant(otherTalkUser);

  return conversationBuilder;
}

export function addPopup(popup: Talk.Popup) {
  loadedPopups.push(popup);
}

export function destroyAllPopups() {
  if (loadedPopups.length > 0) {
    loadedPopups.forEach((p) => p.destroy());
    loadedPopups = [];
  }
}
