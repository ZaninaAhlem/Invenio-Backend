//client side
const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;
//Options
const { username, roomName } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //New Message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //Visible Height
  const VisibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have i scrolled
  const scrollOffset = $messages.scrollTop + VisibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:m a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ roomName, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    roomName,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

socket.on("output-messages", (data, room) => {
  if (data.length) {
    data.forEach((message) => {
      console.log(room[0]);
      console.log(message.room === room[0]._id);
      if (message.room !== room[0]._id) {
        return null;
      } else {
        msg = generateMessage(message.msg);
        const html = Mustache.render(messageTemplate, {
          username: message.sender,
          message: message.msg,
          createdAt: moment(message.createdAt).format("h:m a"),
        });
        $messages.insertAdjacentHTML("beforeend", html);
        autoscroll();
      }
    });
  }
});

const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

function appendMessages(message) {
  const html = `<div>${message}</div>`;
  messages.innerHTML += html;
}
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //disable button
  // $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    //enable button
    // $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("the message was delivered");
  });
});
socket.emit("join", { username, roomName }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
