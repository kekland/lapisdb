# 💥 LapisDB

[![star this repo](http://githubbadges.com/star.svg?user=kekland&repo=lapisdb&style=flat)](https://github.com/kekland/lapisdb)
[![fork this repo](http://githubbadges.com/fork.svg?user=kekland&repo=lapisdb&style=flat)](https://github.com/kekland/lapisdb/fork)
[![License](https://img.shields.io/github/license/kekland/lapisdb.svg)](https://github.com/kekland/lapisdb)
[![Version](https://img.shields.io/npm/v/lapisdb.svg)](https://www.npmjs.com/package/lapisdb)
[![Downloads](https://img.shields.io/npm/dt/lapisdb.svg)](https://www.npmjs.com/package/lapisdb)
[![Status](https://travis-ci.org/kekland/lapisdb.svg?branch=master)](https://travis-ci.org/kekland/lapisdb)

A **TypeScript** embedded database that is really easy and nice to use. 

## Attention

I am still working on this project, and many things **might change in future**.

## Why?

During my experience writing servers, I often cannot find a database that is both **fast** and **easy** to use.

**LapisDB** tries to solve this problem. It is fully typed and uses **TypeScript** to make the development process a blast.

## Try it out!

```bash
cd my-awesome-project
npm install --save lapisdb
```

[**Download via NPM**](https://npmjs.com/package/lapisdb)


## Example

You can check out a full REST api [here](https://github.com/kekland/lapisdb-example).

```ts
const adapter = new LevelDbAdapter(News, { name: 'news', directory: './database' })
const db = new Datastore('news', adapter)

export class News extends Model<News> {
  body: string;
  author: string;

  constructor(body: string, author: string) {
    super(db)

    this.body = body
    this.author = author
  }
}

// Getting items
const items: News[] = await db.getItems()

// Getting single item
const item: News = await db.get('identifier')

// Adding an item
const newItem: News = await new News('interesting body', 'kekland').save()

// Editing an item
newItem.body = 'a more interesting body'
await newItem.save()

// Deleting an item
await newItem.delete()
```

##  How do I use it?

### 📋 Tutorial

Check out the **GitHub Wiki** page [here](https://github.com/kekland/lapisdb/wiki).

### 📕 Documentation

You can find the full **TypeDoc documentation** [here](https://kekland.github.io/lapisdb) (not updated as of v0.3.0).

## Plugins, additional features

- [LapisDB observatory](https://github.com/kekland/lapisdb_observatory)

- [LevelDB adapter](https://github.com/kekland/lapisdb-level-adapter)

## Contact me

**E-Mail**: `kk.erzhan@gmail.com`
