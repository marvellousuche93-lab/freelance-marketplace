# Deployment Guide

This document lists everything you need to deploy the Freelance
Marketplace to a real server. It is not specific to any host — the
steps work on Railway, Render, Fly.io, Heroku, DigitalOcean App
Platform, or a plain VPS.

## Overview

The deployed app is a single Django process that serves:

1. The REST API at `/api/...`
2. The Django admin at `/admin/`
3. The built React app for every other route

In production, the React build (`frontend/dist/`) is served by Django,
so the whole app is available from one origin and one domain. Media
files (uploaded images) are served by an object store or a reverse
proxy, not by Django.

## 1. Environment variables

On your hosting platform, set these environment variables:
