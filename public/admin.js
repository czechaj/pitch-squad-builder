const byId = (id) => document.getElementById(id);

const state = {
  admin: {
    userId: localStorage.getItem("admin.userId") || "",
    phoneE164: localStorage.getItem("admin.phoneE164") || "",
    role: localStorage.getItem("admin.role") || ""
  },
  member: {
    userId: localStorage.getItem("member.userId") || "",
    phoneE164: localStorage.getItem("member.phoneE164") || "",
    role: localStorage.getItem("member.role") || ""
  },
  roomId: localStorage.getItem("roomId") || ""
};

function setInfo(id, msg) {
  const el = byId(id);
  if (el) el.textContent = msg;
}

function saveAdminSession(user) {
  state.admin = { ...state.admin, ...user };
  localStorage.setItem("admin.userId", state.admin.userId);
  localStorage.setItem("admin.phoneE164", state.admin.phoneE164);
  localStorage.setItem("admin.role", state.admin.role);
}

function saveMemberSession(user) {
  state.member = { ...state.member, ...user };
  localStorage.setItem("member.userId", state.member.userId);
  localStorage.setItem("member.phoneE164", state.member.phoneE164);
  localStorage.setItem("member.role", state.member.role);
}

function saveRoomId(roomId) {
  state.roomId = roomId;
  localStorage.setItem("roomId", roomId);
}

function clearAllSession() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith("admin.") || key.startsWith("member.") || key === "roomId")
    .forEach((key) => localStorage.removeItem(key));
  state.admin = { userId: "", phoneE164: "", role: "" };
  state.member = { userId: "", phoneE164: "", role: "" };
  state.roomId = "";
}

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));
  const screen = byId(`screen-${name}`);
  if (screen) screen.classList.add("active");
  renderSessionInfo();
}

function renderSessionInfo() {
  if (state.admin.userId) {
    setInfo(
      "adminSessionInfo",
      `Admin girisi aktif: ${state.admin.phoneE164} (${state.admin.role})${state.roomId ? `\nSon roomId: ${state.roomId}` : ""}`
    );
  } else {
    setInfo("adminSessionInfo", "Henuz admin girisi yapilmadi.");
  }

  if (state.admin.userId) {
    setInfo("adminLoginInfo", `Aktif admin oturumu: ${state.admin.phoneE164}`);
  }
  if (state.member.userId) {
    setInfo("memberLoginInfo", `Aktif davetli oturumu: ${state.member.phoneE164}`);
  }
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Islem basarisiz");
  return data;
}

async function requestOtp(phone, infoId) {
  try {
    const data = await postJson("/auth/mock-otp/request", { phone });
    setInfo(infoId, `Kod olusturuldu (mock): ${data.mockCode}`);
  } catch (error) {
    setInfo(infoId, error.message);
  }
}

async function verifyOtp(phone, code, mode) {
  const data = await postJson("/auth/mock-otp/verify", { phone, code });
  if (mode === "admin") saveAdminSession(data);
  if (mode === "member") saveMemberSession(data);
  renderSessionInfo();
  return data;
}

document.querySelectorAll("[data-screen]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screen));
});

byId("resetSessionBtn").onclick = () => {
  clearAllSession();
  [
    "bootstrapInfo",
    "adminLoginInfo",
    "adminSessionInfo",
    "roomInfo",
    "memberLoginInfo",
    "joinInfo"
  ].forEach((id) => setInfo(id, ""));
  byId("inviteList").innerHTML = "";
  showScreen("home");
};

byId("bootstrapAdminBtn").onclick = async () => {
  const phone = byId("bootstrapPhone").value.trim();
  try {
    const data = await postJson("/auth/bootstrap-admin", { phone });
    saveAdminSession(data);
    setInfo("bootstrapInfo", `Admin kaydedildi: ${data.phoneE164}`);
    showScreen("admin-login");
  } catch (error) {
    setInfo("bootstrapInfo", error.message);
  }
};

byId("adminRequestOtpBtn").onclick = async () => {
  await requestOtp(byId("adminPhone").value.trim(), "adminLoginInfo");
};

byId("adminVerifyOtpBtn").onclick = async () => {
  try {
    const data = await verifyOtp(byId("adminPhone").value.trim(), byId("adminOtpCode").value.trim(), "admin");
    if (data.role !== "ADMIN") {
      setInfo("adminLoginInfo", "Bu kullanici admin degil.");
      return;
    }
    setInfo("adminLoginInfo", `Admin girisi basarili: ${data.phoneE164}`);
    showScreen("admin-panel");
  } catch (error) {
    setInfo("adminLoginInfo", error.message);
  }
};

byId("createRoomBtn").onclick = async () => {
  if (!state.admin.userId) {
    setInfo("roomInfo", "Once admin girisi yap.");
    return;
  }

  const invitedPhones = byId("invitedPhones").value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    const data = await postJson("/rooms", {
      adminUserId: state.admin.userId,
      name: byId("roomName").value.trim(),
      invitedPhones
    });
    saveRoomId(data.roomId);
    setInfo("roomInfo", `Oda olusturuldu: ${data.roomId}`);
    const ul = byId("inviteList");
    ul.innerHTML = "";
    (data.invites || []).forEach((invite) => {
      const li = document.createElement("li");
      li.innerHTML = `${invite.phoneE164} -> <strong>${invite.refCode}</strong> <button type="button">Kopyala</button>`;
      li.querySelector("button").onclick = async () => {
        await navigator.clipboard.writeText(invite.refCode);
        setInfo("roomInfo", `Kopyalandi: ${invite.refCode}`);
      };
      ul.appendChild(li);
    });
    renderSessionInfo();
  } catch (error) {
    setInfo("roomInfo", error.message);
  }
};

byId("memberRequestOtpBtn").onclick = async () => {
  await requestOtp(byId("memberPhone").value.trim(), "memberLoginInfo");
};

byId("memberVerifyOtpBtn").onclick = async () => {
  try {
    const data = await verifyOtp(byId("memberPhone").value.trim(), byId("memberOtpCode").value.trim(), "member");
    setInfo("memberLoginInfo", `Davetli girisi basarili: ${data.phoneE164}`);
    showScreen("member-join");
  } catch (error) {
    setInfo("memberLoginInfo", error.message);
  }
};

byId("joinBtn").onclick = async () => {
  if (!state.member.userId) {
    setInfo("joinInfo", "Once davetli girisi yap.");
    return;
  }

  try {
    const data = await postJson("/rooms/join-by-ref", {
      refCode: byId("joinRefCode").value.trim(),
      userId: state.member.userId,
      phone: byId("memberPhone").value.trim()
    });
    saveRoomId(data.roomId);
    setInfo("joinInfo", `Odaya katilim basarili. roomId: ${data.roomId}`);
  } catch (error) {
    setInfo("joinInfo", error.message);
  }
};

if (state.admin.userId && state.admin.role === "ADMIN") {
  showScreen("admin-panel");
} else {
  showScreen("home");
}
