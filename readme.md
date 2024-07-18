# 🏓 Transcendence 🏓 
  
## Table of Contents
- [Transcendence](#transcendence)
- [Requirements](#requirements)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Docker Container Setup](#docker-container-setup)
- [Database Schema](#database-schema)
- [Features](#database-schema)
  - [User Account](#user-account)
  - [Chat](#chat)
  - [Game](#game)
  - [Security](#security)
- [Contributors](#contributors)
  
## Transcendence
Transcendence is a fullstack web project about creating a single-page web application where users can chat and play Pong against each other in real-time.  
This project is part of [42](https://www.42network.org/)/[Codam](https://www.codam.nl/)'s curriculum.  
  
## Requirements
You can find the full list of project requirements here: [Project Requirements](https://github.com/MichelleJiam/transcendence/wiki/Requirements)
  
## Usage
  
### Run

1. Install and run `Docker`

2. Clone this repository.

```console
git clone https://github.com/maresverbrugge/Transcendence
```

3. Run script or makefile to start the deployment of our project using Docker Compose. 

4. Navigate here to see our application:

| [`localhost:ADD_PORT`](http://localhost:PORT) | Navigate here to see frontend |  
| [`localhost:ADD_PORT`](http://localhost:PORT) | Navigate here to see database |  

---

## Tech Stack

This is a full-stack single-page web application built using NestJS (backend), [ADD FRONTEND HERE] (frontend), PostgreSQL (database), and Docker (environment).

### Docker Container Setup

In our project, we've adopted a containerized approach using Docker to ensure consistent and portable deployment. We've set up three containers, each serving a distinct role:

**Backend Container:**

- This container hosts the backend of our application powered by NestJS.
- It's configured to run on port 3000 within the container.
  
**Frontend Container:**

- The frontend of our application, built with [ADD FRAMEWORK], resides within this container.
- The container is configured to listen on port 8080.

**Database Container:**

- Our PostgreSQL database is contained within this Docker container.
- The container communicates via port [ADD PORT].


## Database Schema



## Features

## User Account

- **Secure Login:** Seamlessly log in through OAuth using the 42 intranet, ensuring both accessibility and account security.

- **Customization:** Personalize your identity by choosing your own username and avatar, visible across the website.

- **Two-Factor Authentication:** Strengthen account security with options like Google Authenticator or SMS verification.

- **Friend Connections:** Add other users as friends to stay informed about their online status (online, offline, in a game)

- **Stats and Achievements:** Showcase your gaming prowess with detailed stats, wins, losses, ladder levels, and achievements displayed on your profile.

- **Match History:** Relive your gaming journey through Match History, encompassing 1v1 games, ladder matches, and more.

- **Leaderboard:** See who's on top of the tournament, users go up and down in ranking after each win/loss.

## Chat

- **Chatroom Creation:** Create public, private, or password-protected chat rooms tailored to your preferences.

- **Direct Messaging:** Establish one-on-one connections with fellow gamers through direct messaging.

- **User Blocking:** Exercise control over your interactions by blocking users, ensuring a focused and comfortable environment.

- **Channel Ownership:** Initiate channels and become the automatic owner, with the ability to set, change, and manage passwords.

- **Channel Administration:** Channel owners can designate administrators, empowering them to maintain a respectful atmosphere and regulate user activities.

- **Banning, and muting:** Chatroom administrators can ban or mute users from chatrooms.

- **Invitations and Profiles:** Seamlessly send game invitations and access player profiles for a comprehensive understanding of your fellow gamers.

## Game

- **Real-time game:** Engage in real-time Pong matches, bringing the classic game to life through seamless online play.

- **Game by invite:** Users can invite specific users to a game of Pong via DM.

- **Matchmaking:** Experience fair and exciting matchups through our automated matchmaking system. Join a queue and get paired with opponents for competitive Pong action.

## Security

hier moet nog een heel verhaal over security en tokens en weet ik wat  
  

## Contributers
This is a project made by team Transcendancing Queens!  
[Jeroen van Halderen](https://github.com/Jeroenvh99)  
[Felicia Koolhoven](https://github.com/fkoolhoven)  
[Flen Huisman](https://github.com/fhuisman)  
[Mares Verbrugge](https://github.com/maresverbrugge)  