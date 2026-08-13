# Festive Quest

Build a visually stunning single-page web app prototype called “Festive Quest”.

This is NOT a normal ecommerce website.

It is a gamified AI festive shopping and styling room where users build their real-world Diwali look the way they equip a character in an RPG.

Main visual direction

Create an original premium Diwali fantasy RPG dressing-room interface.

The feeling should combine:

elegant Indian festive luxury

RPG equipment / inventory UI

warm cinematic Diwali atmosphere

modern premium game interface

immersive character-focused experience

Use deep jewel tones, warm golden lighting, subtle diya glow, palace-inspired decorative details, soft particles, ornamental borders, and premium typography.

Do NOT copy graphics, logos, screenshots, characters, or exact UI from any existing game.

Avoid making this look like:

a generic ecommerce store

a SaaS dashboard

a simple grid of shopping cards

a generic purple AI website

Layout

Design primarily for desktop first.

Center — HERO AREA

The largest and most important area must be a tall character viewport in the center.

For now, create an elegant placeholder character/mannequin/avatar presentation.

Make the viewport feel as if a 3D RPG character will eventually live here.

Include subtle lighting, floor glow, particles, depth, and an atmospheric palace/dressing-room background.

The center character must visually dominate the page.

Add small controls below the character:

Rotate

Zoom

Reset View

They can be UI-only placeholders for now.

Left side — EQUIPMENT SLOTS

Create RPG-style equipment slots vertically around the character area.

Categories:

Outfit

Necklace

Earrings

Bangles

Ring

Shoes

Accessory

Each slot should feel like a real RPG equipment slot:

ornate frame

icon

label

empty/equipped state

subtle hover animation

Show one or two slots as already equipped for visual demonstration.

Right side — FESTIVE INVENTORY

Create a compact inventory/product panel titled:

Diwali Collection

Show a few beautiful demo product cards.

Each card should include:

product image placeholder

item name

price

small “Try On” button

“Equip” button

Keep these cards secondary to the character.

They should feel like items inside a game inventory, not Amazon-style ecommerce cards.

Include category tabs such as:

Outfits | Jewellery | Shoes | Accessories

Top area

Create a compact fantasy-game-style header.

Brand:
Festive Quest

Subtitle:
Build your real-world festive look like you equip an RPG character.

Include:

Diwali selected as the current festival

budget indicator

small profile/avatar button

Do not create a large marketing navbar.

Bottom / character action

Under the character, create a prominent but elegant button:

✨ Finalize My Look

Below or beside it, show a locked/secondary action:

🎮 Generate My 3D Character

Add a tiny note:
“Available after your look is finalized.”

This represents our future flow where the final look will be transformed into a 3D character.

Interaction

Add tasteful micro-interactions:

equipment slot hover glow

inventory card hover

button animations

subtle floating particles

soft panel transitions

Avoid excessive animation.

Technical structure

Use React and clean reusable components.

Structure the UI so that later we can integrate:

Perfect Corp / YouCam virtual try-on APIs

React Three Fiber / Three.js for a real rotatable GLB character

Meshy API for final Image-to-3D generation

For now, DO NOT integrate any external APIs.

DO NOT ask for API keys.

Use mock/demo data only.

Do not build authentication, database, checkout, affiliate integration, or backend yet.

Priority

The first impression should be:

“This feels like a beautiful RPG equipment screen built for Diwali shopping.”

The character must be the visual hero, not the products.

Make this first screen polished enough to look impressive in a hackathon demo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a377a3b0-a3e0-4ba5-bc92-67680f404e5f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
