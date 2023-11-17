document.addEventListener('DOMContentLoaded', () => {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

   // Listen for sent emails
   document.querySelector('#compose-form').onsubmit = send_email;
});

const compose_email = () => {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

const load_mailbox = (mailbox) => {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get request for the emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    
    // Loop over emails object
    emails.forEach(email => {
      // Create new email div with info needed
      const emailDiv = document.createElement('div');
      emailDiv.className = 'email list-group-item list-group-item-action flex-column align-items-start';
      emailDiv.innerHTML = `
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">From: ${email.sender}</h5>
        <small>${email.timestamp}</small>
      </div>
      <p class="mb-1">Subject: ${email.subject}</p>
    `;

      // Change background based on if email is read
      if (email.read) {
        emailDiv.classList.add('list-group-item-secondary'); // Bootstrap class for grey background
      }

      // If email is clicked
      emailDiv.addEventListener('click', () => view_email(email.id, mailbox));

      // Append the emailDiv to the emails-view
      document.querySelector('#emails-view').appendChild(emailDiv);
    });
  });
}

const send_email = () => {

  // Get email data
  const compose_recipients = document.querySelector('#compose-recipients').value;
  const compose_subject = document.querySelector('#compose-subject').value;
  const compose_body = document.querySelector('#compose-body').value;

  // Post request for sending email
  fetch(`/emails`, {
    method: 'POST',
    body: JSON.stringify({
      recipients: compose_recipients,
      subject: compose_subject,
      body: compose_body
    })
  })
  .then(response => response.json())
  .then(result => {

    // load the sent mailbox
    load_mailbox('sent');
  })

  return false
}

const view_email = (id, mailbox) => {
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    const emailView = document.querySelector('#email-view');
    emailView.innerHTML = `
    <div class="card">
      <div class="card-header">
        <strong>From:</strong> ${email.sender}
      </div>
      <div class="card-body">
        <h5 class="card-title">
        <strong>Subject:</strong> ${email.subject}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${email.timestamp}</h6>
        <p class="card-text">${email.body}</p>
      </div>
    </div>
  `;

    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    });
  });
}