# 💥 LapisDB

[![star this repo](http://githubbadges.com/star.svg?user=kekland&repo=lapisdb&style=flat)](https://github.com/kekland/lapisdb)
[![fork this repo](http://githubbadges.com/fork.svg?user=kekland&repo=lapisdb&style=flat)](https://github.com/kekland/lapisdb/fork)
[![License](https://img.shields.io/github/license/kekland/lapisdb.svg)](https://github.com/kekland/lapisdb)
[![Version](https://img.shields.io/npm/v/lapisdb.svg)](https://https://www.npmjs.com/package/lapisdb)
[![Downloads](https://img.shields.io/npm/dt/lapisdb.svg)](https://https://www.npmjs.com/package/lapisdb)

A **TypeScript** embedded database built on top of [LevelDB](https://github.com/level/level) - a fast and efficient C++ database.

## ❗ Attention

I am still working on this project, and many things **might change in future**.

## 💾 Installation

[**Download via NPM**](https://https://www.npmjs.com/package/lapisdb)

```bash
cd my-awesome-project
npm install --save lapisdb
```

## ❓ Why in the world do I need another database?

During my experience writing **backend services**, I often cannot find a database that is both **fast** and **easy** to use.

**LapisDB** is fully typed and uses **TypeScript** under the hood to make the development process a blast.

## 🔨 How do I use it?

### 📕 Documentation

You can find the full **TypeDoc documentation** [here](https://kekland.github.io/lapisdb).

### 📋 Table of contents

1. [Creating models](#creating-models)
2. [Creating Datastore](#creating-datastore)
3. [Pushing objects](#pushing-objects)
4. [Getting objects](#getting-objects)
5. [Editing objects](#editing-objects)
6. [Deleting objects](#deleting-objects)
7. [Additional features](#additional-features)

### Creating models

**LapisDB** uses a concept of Models, that I ~~stole~~ borrowed from various other databases (**MongoDB and mongoose**) and ORMs (**TypeORM**).

Let's say we want to create a model called Human, that has a name and an age.

To do that, we simply write a class for the object, and extend the class from **Model** class.

```ts
//Do not forget to extend from Model, passing the class itself as its generic.
export class Human extends Model<Human> {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    super()
    this.name = name
    this.age = age
  }
}
```

This model will now inherit few methods and fields from **Model** superclass. This includes the special **meta** field, that contains the **id** and *created/last edited* **time** as UNIX timestamp.

### Creating Datastore

**LapisDB** uses low-level **LevelDB** database and provides higher-level abstraction for your objects. To start, you have to create a `Datastore` object.

Now, lets create a **Datastore** for our **Human** model. To do that, you create a new **Datastore** object, passing the **name of database** first, then the **location of it**, and then creating a function that returns the **type of the model**.

```ts
//new Datastore<T>(databaseName, databaseLocation, () => Type)
const store = new Datastore<Human>('human', './database', () => Human)
```

### Pushing objects

To push object, you call **.push()** method on the datastore, then pass an object to push via **.item()** method.

```ts
let human = new Human(`John`, 19);
human = await store.push().item(human).run()
  
// Now our human will contain field called 'meta'.
// {created: number, updated: number, id: string}
console.log(human.meta)
```

You can also push multiple objects at once using **.pushBatched()** method. This will increase the performance significantly if the number of objects is over 100.

```ts
const operation = await store.pushBatched()
for(let i = 0; i < 100; i++) {
  operation.item(new Human(`Human ${i}`, i))
}
const humans = await operation.run()
```

Or, you can add an array of objects via **.items()**.

```ts
let humans: Human[] = []
for(let i = 0; i < 100; i++) {
  humans.push(new Human(`Human ${i}`, i))
}
humans = await store.pushBatched().items(humans).run()
```

### Getting objects

Now this is the interesting part. To get objects from **LapisDB** datastore, you should call **get()** method on the datastore.

```ts
const operation = store.get()
```

This will return a new **GetOperation** object, that you can modify by calling methods like **skip()**, **take()**, **filter()**, etc. To get the results, you can call method **result()** or **run()**.

#### Getting all objects

If you simply want to get all the objects, you can call **.result()** on the operation.

```ts
// Returns all humans.
const data: Human[] = await store.get().result()
```

#### Skip and take (limit and skip)

If you want to set **skip** and **take** parameters, you can call the corresponding methods on the **GetOperation** object. By default, **skip** is set to **zero**, while **take** is **Infinity**.

Alternatively, you can call method **paginate()**, passing the data in form of an object.

```ts
// Returns the first 5 humans, sorted by their id.
const data: Human[] = await store.get()
                                 .skip(0)
                                 .take(5)
                                 .result()

// Alternatively, you can use .paginate() instead.
//Those two methods will have the same result.
const data: Human[] = await store.get()
                                 .paginate({skip: 0, take: 5})
                                 .result()

```

#### Filtering

**LapisDB's** filtering is very easy to write, unlike other databases or ORMs. Also, all of it is typed, so **IntelliSense** in, for example, *Visual Studio Code* will show you autocompletion suggestions.

To filter, you simply call a .filter() method, where you pass a function to call on each object.

```ts
// Get all humans with age over 18
const data: Human[] = await store.get()
  .filter((human) => human.age > 18)
  .result()

// Get all humans with name John
const data: Human[] = await store.get()
  .filter((human) => human.name == 'John')
  .result()

// Get humans with name Albert that are over 18
const data: Human[] = await store.get()
  .filter((human) => human.name == 'Albert' && human.age > 18)
  .result()
```

In the filtering function you can do whatever you want.

#### Sorting

You can **sort** the results too. To do that, simply call the **.sort()** method on **GetOperation** object, and pass a **SortOperator** object as an argument.

For example:

```ts
// Sort by age in ascending order
const data: Human[] = await store.get()
  .sort(new SortOperator({
    age: {sort: SortDirection.Ascending}
  }))
  .result()

// You can add complex sorting mechanisms, involving priorities, custom comparators, etc.

// For the keys you want to sort you have to describe the sorting process via a ISortingField object. You can set its priority (by default is 0), and the sort field can take either SortDirection enum, or your own comparator.
const data: Human[] = await store.get()
  .sort(new SortOperator({
    age: {priority: 1, sort: SortDirection.Descending},
    name: {sort: (a, b) => myComparatorFunction(a, b)} // Priority is 0 by default
  }))
  .result()

```

#### Everything together

The cool part is that you can add everything together. The order of operations is as follows:

1. **Filtering**
2. **Paginating**
3. **Sorting**

```ts
const data: Human[] = await store.get()
  .sort(new SortOperator({
    name: {
      sort: SortDirection.Descending,
    }
  }))
  .filter((human) => human.name != 'Andrew')
  .skip(0)
  .take(3)
  .result()
```

### Editing objects

In **LapisDB**, there are two ways to edit an object.

The first way is to create new **EditOperation** object, then call required functions.

```ts
// Set the age of an object with id 'my-id' to 19.
await store.edit().id('my-id').with({age: 19}).run()

// Or, you can do the same with passing an object instead of it
const human = await store.get().first()
await store.edit().item(human).with({age: human.age + 1}).run()
```

The second way is to get an object via **GetOperation**, then edit its fields and call **.save()** on it.

```ts
const human = await store.get().first()
human.age++
await human.save()
```

### Deleting objects

Again, there are two ways to delete an object.

You can call **.delete()** method on the Datastore object and pass either the object or id.

```ts
await store.delete().id('my-id').run()

// Or:
const human = await store.get().first()
await store.delete().item(human).run()
```

Just as with the Push operation, there is also the batched version.

```ts
await store.deleteBatched().ids(['a', 'b']).run()

// Or:
// This will delete all items.
const items = await store.get().run()
await store.deleteBatched().items(items).run()
```

And, you can call the **.delete()** method on the Model object itself.

```ts
const item = await store.get().first()
await item.delete()
```

Of course, if you need to delete large amounts of data, using batched version will be faster.

### Additional features

*Coming soon*: hooks, server, etc.

## 📧 Contact me

**E-Mail**: `kk.erzhan@gmail.com`
