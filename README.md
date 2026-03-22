
# Threadline

Threadline is a multi-source news explorer designed to transform how users consume and interpret news. Rather than presenting a continuous, unstructured feed of headlines, the application focuses on organizing articles into meaningful groupings that reflect how stories are actually being covered across different outlets. The core idea behind Threadline is that news consumption is not just about reading individual articles, but about understanding the broader narrative landscape. By grouping articles into topics and then further into subtopics, the platform allows users to quickly grasp what is happening and how different sources are framing the same events.

At its core, Threadline is built around the idea of structured comparison. Traditional news aggregators prioritize speed and volume, often overwhelming users with information. In contrast, Threadline attempts to reduce cognitive load by organizing content into digestible clusters, making it easier to identify patterns, biases, and differences in coverage.

---

## What I Built

Threadline consists of two main components: a data processing pipeline and a frontend application. These two systems are intentionally decoupled, allowing each to evolve independently while keeping the overall architecture simple and efficient.

The data pipeline is responsible for collecting and structuring the raw news data. It begins by fetching articles from multiple RSS feeds, each of which may have slightly different formats and metadata. These articles are then normalized into a consistent internal structure, ensuring that downstream processing can operate uniformly regardless of the source. Once normalized, the articles are grouped into high-level topics such as Politics, Technology, Business, and Entertainment.

After topic classification, the pipeline performs a second level of grouping by organizing articles into subtopics. These subtopics are intended to represent specific story angles or narratives within a broader topic. For example, within Technology, different subtopics might correspond to cybersecurity incidents, AI developments, or major product announcements. Once this structuring is complete, the entire dataset is serialized and written to a static JSON file.

The frontend application, built using Next.js, consumes this precomputed dataset. It renders a homepage that highlights the most active topics and recent articles, and provides dedicated pages for each topic where users can explore subtopics in more detail. Within each subtopic, articles from different sources are displayed together, allowing users to directly compare how the same story is covered across outlets.

This separation between data generation and presentation is a deliberate design choice that simplifies both systems while improving performance.

---

## Technical Decisions

One of the most significant technical decisions was to move all heavy data processing out of the request lifecycle and into a build-time pipeline. Initially, I experimented with computing topics and subtopics dynamically within the application itself. While this approach worked in a basic sense, it quickly revealed several issues. Page loads became slower as more articles were processed, API calls to the AI model were repeated unnecessarily, and results were inconsistent across requests due to non-deterministic grouping.

To address this, I introduced a dedicated script that runs independently of the web application. This script handles all data fetching, processing, and structuring, and outputs a single JSON file that the frontend can read. By doing this, the application effectively becomes a static viewer over precomputed data, which significantly improves performance and reliability. It also reduces operational costs by avoiding repeated AI calls during user interactions.

Another important decision was to use scheduled batch processing instead of a continuously running backend service. Rather than maintaining a server or job queue, I used GitHub Actions to run the data pipeline at regular intervals. Every hour, a workflow executes the build script, regenerates the dataset, and commits any changes back to the repository. This commit then triggers a deployment on Vercel, ensuring that the live site always reflects the latest data. This approach minimizes infrastructure complexity while still providing reasonably fresh updates.

The most challenging technical decision involved subtopic generation. Initially, I attempted to implement this using traditional NLP techniques with a library that extracted named entities and keywords from article text. The idea was to cluster articles based on shared entities. In practice, this approach produced poor results. The generated subtopics were often meaningless, consisting of generic or irrelevant terms such as days of the week or common words that happened to appear frequently.

Recognizing the limitations of this approach, I transitioned to using a language model to perform the grouping. Instead of relying on surface-level token similarity, the model is given a set of articles and asked to group them into a small number of coherent subtopics. The model returns structured JSON, mapping article IDs to subtopic labels. This approach leverages the model’s ability to understand semantic relationships, resulting in significantly more meaningful groupings.

---



## Product Decisions

From a product perspective, the most important decision was to prioritize clarity and structure over completeness. Rather than attempting to display every available article, Threadline focuses on presenting a curated view of the most relevant stories, organized in a way that highlights relationships between them.

The decision to group articles into topics and subtopics was driven by the observation that users often want to understand the bigger picture rather than individual pieces of information. By organizing content into clusters, the application helps users quickly identify what stories are being covered and how different sources are approaching them.

Another key decision was to emphasize comparison. Each subtopic contains articles from multiple outlets, allowing users to see different perspectives side by side. This design encourages users to think critically about the information they are consuming, rather than passively reading a single source.

The interface is intentionally minimal, focusing on readability and ease of navigation. Elements such as article counts, source indicators, and subtopic groupings are designed to provide context without overwhelming the user.

---

## What I Would Do With More Time


Given more time, there are several areas where the system could be improved.

The most immediate improvement would be expanding beyond the current set of five news sources. This is relatively straightforward from a technical standpoint, as each additional source can be integrated with minimal effort, typically requiring only a single line of configuration per feed.

Another major improvement would be to adopt a hybrid clustering approach that combines embeddings with AI labeling. Articles could first be grouped based on semantic similarity using vector embeddings, and then labeled using a language model. This would likely produce more consistent results while reducing reliance on the model for full clustering.

The deployment architecture is another area that could be improved. Currently, each data update triggers a full redeployment of the application, which is not ideal. A more scalable approach would involve storing the data in an external system such as object storage or a database, and having the frontend fetch it at runtime. This would decouple data updates from deployments and reduce unnecessary build overhead.

The data pipeline could also benefit from caching and incremental updates. At the moment, all articles are processed on each run, even if many of them have not changed. Introducing caching would allow the system to focus only on new or updated content, improving efficiency and reducing API usage.

From a product and design perspective, there is significant room to improve the user interface and overall user experience. While the current UI is functional, it is still fairly minimal and could be made more polished and intuitive. With more time, I would focus on improving visual hierarchy, making subtopics easier to scan, enhancing the layout for cross-source comparisons, and creating a more refined and responsive design, especially for mobile devices.

Finally, features such as user personalization, saved topics, and custom feeds could further enhance the experience by allowing users to tailor the platform to their interests.

---

## Final Thoughts

Threadline began as a simple experiment in news aggregation but evolved into a more structured system for understanding coverage across sources. The development process highlighted the limitations of traditional heuristic approaches when dealing with language and demonstrated the value of incorporating AI for tasks that require semantic understanding.

The final architecture reflects a balance between simplicity and functionality. By separating data processing from presentation and using a batch processing model, the system remains efficient and maintainable while still delivering a meaningful user experience. The challenges encountered along the way ultimately led to a more robust and thoughtful design.

As a final note, the live deployment of this project is temporary. The site is currently hosted at [Threadline](https://threadline-five.vercel.app/) and will remain available for 14 days (starting from 3/21/26), as it is running on Vercel’s free trial.
