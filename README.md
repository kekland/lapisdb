# 💥 fDB

A **TypeScript** embedded database built on top of [LevelDB](https://github.com/level/level) - a fast and efficient C++ database.

## ❗ Attention

I am still working on this project, and many things **might change in future**.

## 💾 Installation

Right now, I **do not recommend** you to try and download the code - because it is still incomplete. When the project will be ready for usage, I will upload it to **NPM**.

## ❓ Why in the world do I need another database?

During my experience writing **backend services**, I often cannot find a database that is both **fast** and **easy** to use.

**fDB** is fully typed and uses **TypeScript** under the hood to make the development process a blast.

Trust me, you will **fall in love** with its syntax.

## 🔨 How do I use it?

### Creating models

**fDB** uses a concept of Models, that I ~~stole~~ borrowed from various other databases (**MongoDB and mongoose**) and ORMs (**TypeORM**).

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

### Creating Datastore

**fDB** uses low-level **LevelDB** database and provides higher-level abstraction for your objects. To start, you have to create a `Datastore` object.

Now, lets create a **Datastore** for our **Human** model. To do that, you create a new **Datastore** object, passing the **name of database** first, then the **location of it**, and then creating a function that returns the **type of the model**.

```ts
//new Datastore<T>(databaseName, databaseLocation, () => Type)
const store = new Datastore<Human>('human', './database', () => Human)
```

### Pushing objects

**Note:** this will be updated.

```ts
const human = new Human(`John`, 19);
await store.methods.push(human)

// Now human will contain field called 'id'.
console.log(human.id) //nanoId identifier.
```

### Getting objects

Now this is the interesting part. To get objects from **fDB** datastore, you should call **get()** method on the datastore.

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

**fDB's** filtering is very easy to write, unlike other databases or ORMs. Also, all of it is typed, so **IntelliSense** in, for example, *Visual Studio Code* will show you autocompletion suggestions.

To filter, you simply call a .filter() method, where you can pass various objects to do some complex filtering.

The following basic example uses the Filter operator.

```ts
// Get all humans with age over 18
const data: Human[] = await store.get()
  .filter(new Filter({
    age: {operator: 'gt', value: 18}
  }))
  .result()

// Get all humans with name John
const data: Human[] = await store.get()
  .filter(new Filter({
    name: 'John'
  }))
  .result()

// Or you can do this
const data: Human[] = await store.get()
  .filter(new Filter({
    name: {operator: 'eq', value: 'John'}
  }))
  .result()

// Get humans with name Albert that are over 18
const data: Human[] = await store.get()
  .filter(new Filter({
    name: 'Albert',
    age: {operator: 'gt', value: 18}
  }))
  .result()
```

#### Complex filters

To do some **complex filtering** (e.g. using OR, AND, NOT operations) you can use objects with the same name. Available filters are:

- **And** - takes its inputs and runs filters in all them, returning **true** if all of its inputs return **true**, otherwise returns **false**.
- **Or** - takes its inputs and runs filters in all of them, returning **true** if at least one of its inputs return **true**, otherwise returns **false**
- **Not** - takes single input and returns the inverse of that filter.
- **Filter** - takes filter data and runs the value against it, returning **true** if the value passes the filter, **false** otherwise.

Examples:

```ts
// Get humans with either the name Albert or that are over 18.
// (name == 'Albert') || (age > 18)
const data: Human[] = await store.get()
  .filter(
    new Or(
      new Filter({
        name: 'Albert'
      }),
      new Filter({
        age: {operator: 'gt', value: 18}
      })
    )
  )
  .result()

// Get humans that are not named Albert and that are over 18.
// (name != 'Albert') && (age > 18)
const data: Human[] = await store.get()
  .filter(
    new And(
      new Not(
        Filter({
          name: 'Albert'
        })
      ),
      new Filter({
        age: {operator: 'gt', value: 18}
      })
    )
  )
  .result()

// Get humans that are either below 6 or older than 25 that are named John.
// (((age < 6) || (age > 25)) && (name == 'John'))
const data: Human[] = await store.get()
  .filter(
    new And(
      new Or(
        new Filter({
          age: {operator: 'less', value: 6}
        }),
        new Filter({
          age: {operator: 'greater', value: 25}
        })
      ),
      new Filter({
        name: 'John'
      })
    )
  )

// You get the point.
```

That's the structure of **filters**. Even though it might be a **lot of text**, but the nice point about it is that you get **autocompletion suggestions** while writing it - which is insanely cool - you don't need to memorize the keys and everything. This increases your efficiency a lot.

#### Sorting

You can **sort** the arrays too. To do that, simply call the **.sort()** method on **GetOperation** object, and pass a **SortOperator** object as an argument.

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
  .filter(new Not(
    new Filter({ name: 'Andrew' })
  ))
  .skip(0)
  .take(3)
  .result()
```

### Editing objects

*Coming soon*

### Deleting objects

*Coming soon*

### Additional features

*Coming soon*

## Contact me

**E-Mail**: `kk.erzhan@gmail.com`
