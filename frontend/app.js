const API = '/api/meetings';

const form = document.getElementById('meetingForm');
const tableBody = document.getElementById('tableBody');
const msg = document.getElementById('msg');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const fields = ['book_title', 'author', 'meeting_date', 'meeting_time', 'location', 'host_name'];

function showMsg(text, isError = false) {
  msg.textContent = text;
  msg.style.color = isError ? '#c0392b' : '#27ae60';
  setTimeout(() => (msg.textContent = ''), 3000);
}

function escapeHtml(v) {
  const d = document.createElement('div');
  d.textContent = v ?? '';
  return d.innerHTML;
}

async function loadMeetings() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    tableBody.innerHTML = data.map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${escapeHtml(m.book_title)}</td>
        <td>${escapeHtml(m.author)}</td>
        <td>${escapeHtml(m.meeting_date)}</td>
        <td>${escapeHtml(m.meeting_time)}</td>
        <td>${escapeHtml(m.location)}</td>
        <td>${escapeHtml(m.host_name)}</td>
        <td>
          <button class="edit" onclick="editMeeting(${m.id})">Edit</button>
          <button class="del" onclick="deleteMeeting(${m.id})">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    showMsg('Could not load meetings. Is the server running?', true);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('meetingId').value;
  const body = {};
  fields.forEach(f => (body[f] = document.getElementById(f).value));

  try {
    const res = await fetch(id ? `${API}/${id}` : API, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    showMsg(id ? 'Meeting updated.' : 'Meeting added.');
    resetForm();
    loadMeetings();
  } catch (err) {
    showMsg(err.message, true);
  }
});

async function editMeeting(id) {
  const res = await fetch(`${API}/${id}`);
  const m = await res.json();
  document.getElementById('meetingId').value = m.id;
  fields.forEach(f => (document.getElementById(f).value = m[f] ?? ''));
  saveBtn.textContent = 'Update Meeting';
  cancelBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteMeeting(id) {
  if (!confirm('Delete this meeting?')) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showMsg('Meeting deleted.');
    loadMeetings();
  } catch (err) {
    showMsg(err.message, true);
  }
}

function resetForm() {
  form.reset();
  document.getElementById('meetingId').value = '';
  saveBtn.textContent = 'Add Meeting';
  cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);
loadMeetings();