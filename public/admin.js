const byId = (id) => document.getElementById(id);
const state = {
  userId: localStorage.getItem("userId") || "",
  phoneE164: localStorage.getItem("phoneE164") || "",
  role: localStorage.getItem("role") || "",
  roomId: localStorage.getItem("roomId") || ""
};

function setInfo(id, msg) {
  byId(id).textContent = msg;
}

function saveSession() {
  localStorage.setItem("userId", state.userId);
  localStorage.setItem("phoneE164", state.phoneE164);
  localStorage.setItem("role", state.role);
  if (state.roomId) localStorage.setItem("roomId", state.roomId);
}

function restoreInfo() {
  if (state.userId) setInfo("otpInfo", `Giriş var: ${state.phoneE164} (${state.role})`);
  if (state.roomId) setInfo("roomInfo", `Aktif roomId: ${state.roomId}`);
}

byId("requestOtpBtn").onclick = async () => {
  const phone = byId("phone").value.trim();
  const r = await fetch("/auth/mock-otp/request", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone })
  });
  const d = await r.json();
  if (!r.ok) return setInfo("otpInfo", d.error || "Kod isteği başarısız");
  setInfo("otpInfo", `Kod üretildi (mock): ${d.mockCode}`);
};

byId("verifyOtpBtn").onclick = async () => {
  const phone = byId("phone").value.trim();
  const code = byId("otpCode").value.trim();
  const r = await fetch("/auth/mock-otp/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, code })
  });
  const d = await r.json();
  if (!r.ok) return setInfo("otpInfo", d.error || "Kod doğrulama başarısız");
  state.userId = d.userId;
  state.phoneE164 = d.phoneE164;
  state.role = d.role;
  saveSession();
  setInfo("otpInfo", `Giriş başarılı: ${state.phoneE164} (${state.role})`);
};

byId("createRoomBtn").onclick = async () => {
  if (!state.userId) return setInfo("roomInfo", "Önce giriş yap.");
  const name = byId("roomName").value.trim();
  const invitedPhones = byId("invitedPhones").value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const r = await fetch("/rooms", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ adminUserId: state.userId, name, invitedPhones })
  });
  const d = await r.json();
  if (!r.ok) return setInfo("roomInfo", d.error || "Oda oluşturma başarısız");
  state.roomId = d.roomId;
  saveSession();
  setInfo("roomInfo", `Oda oluşturuldu: ${d.roomId}`);

  const ul = byId("inviteList");
  ul.innerHTML = "";
  (d.invites || []).forEach((x) => {
    const li = document.createElement("li");
    li.textContent = `${x.phoneE164} -> ${x.refCode}`;
    ul.appendChild(li);
  });
};

byId("joinBtn").onclick = async () => {
  if (!state.userId) return setInfo("joinInfo", "Önce giriş yap.");
  const refCode = byId("joinRefCode").value.trim();
  const phone = byId("phone").value.trim();
  const r = await fetch("/rooms/join-by-ref", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refCode, userId: state.userId, phone })
  });
  const d = await r.json();
  if (!r.ok) return setInfo("joinInfo", d.error || "Katılım başarısız");
  state.roomId = d.roomId;
  saveSession();
  setInfo("joinInfo", `Katılım başarılı. roomId: ${d.roomId}`);
};

restoreInfo();
