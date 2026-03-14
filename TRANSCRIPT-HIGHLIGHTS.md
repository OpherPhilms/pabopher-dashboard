## Transcript Highlights

### 1. Starting at a smaller scale (Session 1, start)

My first prompt was focused on what I needed in that session only and nothing more. Scaffold the project, set up Git (which I ended up doing on my own), build the landing page. I held Claude to a smaller scope like that instead of letting it run with the whole project at once to make a framework to begin.

### 2. Catching a naming error and correcting it (Session 1, early)

Claude misread Pab and Opher as "Pa + Bopher" and built the whole landing page with the wrong names. I caught it almost immediately and corrected it, which led to a slew of fixes all the way down to the README file. Smaller detail but it showed me early on that I needed to review the AI output carefully each step of the way regardless of if it looks right at a glance.

### 3. Steering away from the wrong aesthetic (Session 1, midway)

I asked for a redesign to the current look (which was what I've come to find is the typical look of a claude code website) and used specfic langauge to express what I wanted. Claude produced a dark teminal/Matrix-y look instead of the warm, personal vibe I was looking for. I wrote a more targeted follow up prompt explicity naming what I didn't want (no SaaS aesthetics, no gradients, no rounded corners) and the third version finally landed where I wanted it. Iteration is key to tailor content to your wants.

### 4. API key security catch (Session 3, midway)

When I asked for YouTube API integration for real time stats, Claude flagged that putting the key in a VITE\_ variable would expose it in the browser bundle and therefore cause a security risk for the channel I was adding. We instead pivoted to building a NEtlify serverless function as a proxy instead. I wouldn't have caught something like that on my own.
