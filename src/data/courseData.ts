export interface CourseDataCategoryMap {
  syllabus?: string;
  books?: string;
  notes?: string;
  questions?: string;
  videos?: string;
  papers?: string;
}

export interface CourseDataSemester {
  common?: CourseDataCategoryMap;
  [branch: string]: CourseDataCategoryMap | undefined;
}

export interface CourseDataConfig {
  semesters: number;
  branches: string[];
  common: number[];
  data: Record<number, CourseDataSemester>;
}

export const courseData: Record<string, CourseDataConfig> = {
  "btech": {
    "semesters": 8,
    "branches": [
      "CIVIL",
      "CSE",
      "ELECTRICAL",
      "ECE",
      "MECHANICAL"
    ],
    "common": [
      1,
      2
    ],
    "data": {
      "1": {
        "common": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUhOSmw3VkltTGEwbG5qWjYxRWNzWjBkenFWLVkwR0FkP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWFqc0FVYXoxbzluWk0weWpOVTZ4bFMwbkRVNnNkRnlqP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTExT2Q4NWtaUkdOLWYtSlFaWTlYak5BX3hpTDlueXpMP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWN6WnRYMHpDek5iZjFxMHF4Y3p0YXlmT1hjTHhJZUFHP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXlwa0VJeGlCT3NiYUdtVUhRemMwMHNrbkdfLTBvRmJ4P3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXBIbzhaVWV2WW5xLXNORzMxNnZoRi11blo3TE5VT0VOP3VzcD1kcml2ZV9saW5r"
        }
      },
      "2": {
        "common": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXFaMFNSb2g3R0ZlTnZiWU1CLW5jMHJwNUVNWUtDNVlTP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU9LUGZYWW1zSFE1bjQ2ZkdnSi1FZkF0bC12WUhRYzJEP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUI4RWZKWFhiMGVUTDNhVFRRQTl3X2RuY1BpcW9RMkRTP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW5qRDlFRDJHYmowNHBLYmw5YWV1eE5TQ2s2RVZ0LS1MP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWhXMS0xaXUycFBHZFI0WlM2dm5vejNrV2dIaFB6cnpmP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMV96Z1dUWFQ3M0FzM1NIcUtsSFBjMHRQUkJZZ1pfSkZnP3VzcD1kcml2ZV9saW5r"
        }
      },
      "3": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTJqaDU5SEV5dXh4QUw2MEZyM1BzbzJ1cWZMTFp2V2FHP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXNCUXVmU2w4SjdXVlBuQjExLWFUNUhRM3M4MDBCdGRGP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVhLZjJUZGIyU2U4NThsUmlBdl81bWt1MHBIT3NLY1FOP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUY3TUhfN0RIQzFJSUdXZjRFcTZGQjI5bm1JcFl2M2Z2P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWE3aTlqb2QyaVlmZU9DQno1RG9rN21LaEVRU2lhaUhyP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWFBNUlkZVFndXFjdTJSeHhRVllxUkFUNDNfYm8wekVtP3VzcD1kcml2ZV9saW5r"
        },
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVcwMXZINF9LUHl1U1hVM3hoczkzem5rQWs3RnU0NHlEP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZvdEowT1lJeTV6WGp5d0ZuZnFpM2tLbXdJakZVNzVDP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVprWFhlZGJwMkVyaWZrSmZPWnpXV3FFR295UFZJZ21YP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTAxSUUtM25TWGozektobm94MkdZMnlZak1sTUl6WU1VP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW9xNXdQNEVwaTNlRUx2LVhyc0t1d3VhQTN3QWJ3TldJP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXBTa2kwMzlYVlhUNXVBN0o1c2VOeVQ5czNfVTQ0NmFoP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMS1Hemd1S0JraXBSVXR5SHhKUXhvUlFnTFFyWDRnaGR3P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUx1NjVFV2R2a3lkZE40UzhwYkV2UHYzVzVOQmhEUjB2P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUF5ZjF4YzFIQkhHMllUS0twc3JDS2JfeDZsYnYyM0ZTP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVRHT3NmazZzcGpDWUhDaElEVzZraE5rbDZVNHdhSEFFP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUh4VF9qSC1ydXkwT3QwRXRhYVNmSEoxTjFQa2p2MXZhP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVhOc1BwSVRUUkFrbkRvTDAtM0N1VTFqM1NxMmFRUkNCP3VzcD1kcml2ZV9saW5r"
        },
        "ECE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMV9KX1pLX3JGTGdUMkV6YWF4SkFMQ2RkU3dacDU0eU1yP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMURza3hzNVBCamlPb0paYkl2dzhDUUtoTENITi1YcnhHP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW1zV3IxREN5Ym14bE5VOFAwcFBkV3RQb21SQXlYVmNEP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWtsQk84dWVtUzVkT19ieC1xWF9yTDhTNHhJUk85X3RHP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWZicml2TmxNZENMNHdvdWt4ZkQwUEJzRldQYW9VbjVjP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVY2d1l4TWhVWmtsTURXYVdvY0RyUEpTVkl0eFc2Y1o5P3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTMzY1ZoRnhCZFk3N2VoZkN5czlRWkp5LW5SNHljZExpP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUJQWlQweHpYUEt5Sk1RRURoVmdNM3dLWmNXX0E2cDU3P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTV0Z3RNTkJxbENCUThYb2VlNkNlZHVUMDV5Yzg0VDRtP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWFZTU5uUWZ6RXVNRGtKUWhNd0kyRm5xSFVkY29WLVFVP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXZmLTgtby01OUNwSl9aS1lqbzZIQTdybjU5UXlaTG1VP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWZYTzR0MHlubDRtNmNCOEJDQWwxald5ZmlWODA2QnFhP3VzcD1kcml2ZV9saW5r"
        }
      },
      "4": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWVkaVM4eTNFMUVHenloWVp1RkdPS2JzYVV0VXgzU0kwP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWw5dkVDRHYtQVoyc3lMWFFUbFNoT0JHNHl0Y1AzT1R2P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWhRYjBwSVVqV004WjVGOU15MHJqa1laeld0cUR4QmhSP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUFnaXltSlFTN283Y2VJTDA2UjNGUzF2YlZ0T0hocjc0P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUtwVl9qSk1yMC1TVGtvelBPeTM5dXhyQ2VCSW0xa3dPP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWs3SGJ1cTNGWVktMGRCQ0VDLXotdXFlRmw3WGhUckh6P3VzcD1kcml2ZV9saW5r"
        },
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTlzWFFsaFVmQzNJRDRfb0NZMGFKWUJPT25uenoyR2FzP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTFZbVBuZWxfZDFxcHl5Q0pWRUdKd3RobFIwQWw5NUdqP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWgtNFFLNDFIYjNydlgtTW5pVmw5dzFUak45QUVsMzlUP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZTLWVpMEJjVzZvREJRVGZGb0JkRndwYnJMVk94QjItP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVlzaU90XzdrRnA4WGRrbW9tbjRQNTBnem1hV1JaX25UP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUR3SDEySUZQSFctakliNVQxb1VUQmNOMmtOX1JqcjdxP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW5tNFVRTkJVeUo4eUQwdWpZSkNERDlUU2pxdksyRUJuP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUhWd25XcjBUdERESEx5WENOY1pXRVN2WndtZGZ6VF9aP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMS1CaEdOYThocWp6WklCVFhFZEZ6TFAyOU1OVGlyblA0P3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW1UZXRBTkVGbW9WZDI0ak05ZWxhaVBNdWZhaWYzeEozP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTJxR0tJWlI2X2ZWLXZYY2QzM3hPdGFwdDQ2YkNCZ0FMP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXMzck93RVpka2I5V08tMjVrSnppVFJMRmYtbWRFeldFP3VzcD1kcml2ZV9saW5r"
        },
        "ECE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWUtQy1jdXdLSlNWMklxT3pmWEJCTlR4a0xfbVhQZGg1P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVlxVEJVVjJ2WGEzdVN4ckZycGxHeVdQZkNaWUtjR2JjP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU5lOXpsWUZiZFpmZ1FNdkdOTUYxWXo5QWlObW1nZUFaP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUhTTkl2TkNmNktPTHpiYVVTc3ZTeEFaa2xJWDE4WGJCP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVVXSDhXWmlvS3VJUUFXelpTaW42N0xHUWpvaEdhMEFnP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUJ2QmlMMmo2OXE2QXhHWldNY1lEVVR6MWM2VzRTMGFVP3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTlvZTN1cmI3Y0JMMEdMNHpHWUMzZTljWXBLam9Bb2NRP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVRlbkdmSkdUaWRhYjhJMXMyUWU0NWlOY1E5dGFXaGVWP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUFNQkVPR2NEUHAxWXFDcGNFUWk4QU5mVkhLaWY3Ym5VP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUpWWGdtQ3JnMUs5cUR4aHZEVW95cVYxSkJzeUVHWUJJP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUhjOGJvNVBqV3JXUlJCU1FwR3ZscFVZN2R6a0htWXNkP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXdSQUJNQlFobDVmLWtWLVU3T1pXeG04c2ExaDRiWkw5P3VzcD1kcml2ZV9saW5r"
        }
      },
      "5": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTdKd0FycGZjNEF3ZlljZXFCWlRkLUVMMGMtNnZNZTJBP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUNsNTBKLTRKODE4am1Cc2ZWMVZ4MzBKcWY2aEU3OUdEP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTNkbFlkbFJzZFgtUXdlZkloajd5TEpiY1c0SDN2Q294P3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVV1cW53eEtaSmpyemNQemNBcDBBSHRBQlNwaWVLRkxIP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWJ5RVh6LXN3MHR4VHRDaTdPUFpxZC13NVlvVjRSeDZMP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTZYOXpGeHRQVS1kQ01BTUhHVlJuWmZzSjJaQUJyUnNMP3VzcD1kcml2ZV9saW5r"
        },
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW00aXNLcV9sWlN4STBXR1U5aW1YMHNwVGJPSEFSTEFCP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWpSY1VqY0R6WWpPZkozYkJlb0ZpNng5cXExMVRERkFKP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWFLVjF4bUNCWWl0dDA4TDBpMlI3SjFWallUdkVZNTdZP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTFFMUFkZW9TWnFNWW1qWm95STYteEJFWnQwdjd6Uk11P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVJERHBMQ29WbDdWZ0p1QklRVS1kblFucWdZaXpUbnFqP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVlrR1lMTmcySGFxNTFVLWpTemJyMDB3anVwZXk3YUVZP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZWRDJLejFYaDRwaHVFOUNoazg2M3E5clJVc2ZRVVBfP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZRV2dkRGZid1R0TTBGMUpqSEx6MWoxS3JtVnpVWGJSP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXlpb3Z0enlVT3hTX0p3M3c1Q29zSHFlYjllNFZKbzJDP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVJUX0J1cHRlTEYzU25ibVBFbFVkd2NSc1ZDLTdiWlNTP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXJnSjdyeUM1UDR0X3VJcVVUUTRTQjJ6NnN3V1htbFBoP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUhNeV9tcU9CLUFMUzk5Qk5QOE1MVVVycGdLVmNOci1sP3VzcD1kcml2ZV9saW5r"
        },
        "ECE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTdwWWd1TVVEZXNMQW5nNGl1aUxmc1ZNb0EzX241ekt2P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVVpbGdKVTZjRTVxTDVKdDVRSlYzaGVWa3d4blJNem5WP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUh3dGk5ZDhNcFNqdEV3akh3VUpnaDdqcDJIdnVqVG8wP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU9kVzN2cXN2OTQzeG1LN2tiRURScjBrWTJNVjZJTTQ5P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVNQa2RTLVVVaHg3dkZOLUI2cXlCSll1VDRvcTRtdy1CP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW8telNWT29HRlltTzJ6N1R2dHFhdVl0Z0xidkFFajV3P3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXJQU1VFT3BNTmJobVNaSzg5TDlkZ1ozakFlb19oN19NP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVpDM0FQWkNhUlBJUTJ0Wk02Y1l5OFRpcUc4LW81RHFLP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTRPNThaZFZFeDRZcGl6OFdPdWFvcnJVV2E0YnVlVVVBP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU9hLVpsbG5sUHdJQzBFNHdseWJZTzJVN2Nxdk9GWXVPP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUExQjZhQ1JCQXVvUDJBclNEejlxX09qeVUzZTVITlZCP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUpCZ21nTGRVaGlWN3dFSkxxY0J1S2MxbkdtMXZKSVB6P3VzcD1kcml2ZV9saW5r"
        }
      },
      "6": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUlGb21GbkhrckpRcF9lUm5zTmk4N3VnZjZKWER6MmU3P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUt2WlllVk0yQVRVMzNqTlpKZlIwNTZVaUk3M3ZqVXM3P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVhyM3RIUldCV3RjWXRkei1EYXlrV3lTY1h6Yzlfb0RQP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXNmU3lNSWlZWjBPTERSZnEtdGVNSUd2cHBROGdlWG4zP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXR1LWJYQmktdWVKV3RKVTlGczZMM1l2U1Z0SEhOX3JaP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUNlWkhLR1JJQ2hRczJKdWJsX2pldFh5M0JNSDJDMTJwP3VzcD1kcml2ZV9saW5r"
        },
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTF0SHloZTI5M3BmdHVDYU1EcEFjYUZSQ21ndUR3RTlRP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXA3MHVqcGNoRmJ3cm9LUUpNMm44SnZOMjQtRmItb21oP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWZXeGYtZ0hYNGp5bmpCczRfNFdEbmVYTE5tbTNSdnU0P3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXMtUzVjNEsxLXlraWVlUjBoRjViU3lsRVh0WDN4a1ZJP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWFyUV84QzQ4eU9jaEdjbnRqNm5pbnUzdDVJLVBRc3ltP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXZTcXByZ1g3MGlwUWpCNFhtbi1ZYUpwbjVWNVVWVk9qP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUlnWUVHMDZNTXBBb0RjTDY4bUFXbUdfUHVEX3RIeFZvP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWZkZHFieC02d1RRb09FS2N3YTEybWItallhOHVUaWgzP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVNVZ0gtd1JnQmg0TGtnZjA3aktlVlpRUFhzWnhDRUoyP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTA2NVBtRjBWeXFFbk1IN3UtUVQ5TXBac2Ztd3ZHVjBVP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXUyNV9RQ1d5dHAtaWJpdUdsX1lxYlc0dEwwOVRDWWJ1P3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWMyOUZ3Y0V2d1dGVU5fSkhQSnFtQzllR3F5MDQ3YlpDP3VzcD1kcml2ZV9saW5r"
        },
        "ECE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZHc1FNeE1VdEhWWU85MC05VThLdDZvcXZ6RDZpbHRmP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMURKdXdMU2xvaVVDQXdoQ0lQUk00alpGTUNJS2MzZ3A2P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXFXTWZkU1kyajRkZkJBUTE0b3dtYUdYazhSczV0anlnP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXNZMW1fUWgtNWg1R1Q0cnBMZ3A1M3lpdlhLYmIwSXJ5P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU9iZHNhdGpSLWtoLVp0QXBBQ1laQURvUmg3eVNrRGZMP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUljYmpONWFvWUt1bDZhenIycF9LZmlFdFVvRl9ZY0ttP3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTFxV1hhYi1HWkFPZnZBTFRLd1NVQ2RnbWZqazJSZElvP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVk5RzlWallXWE9JdWN0ZVZ0bXVYMndSSFFFbktEZGx5P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWphNm5NdFl6NXc0dFF3UTE4RkpOZGJhaW9uT2lOZ2FaP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZ4NTNPR0Z3V0dTZjliMmNjQi0zWWw5bGJ1UVhEb3ZhP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUJDM0ZCM0pvSEFKZEEzOURyUTBuVkFDVUZlcWJZLWJRP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWFRS0d3ZXF1M2tTNHVHOVVQRWltTVhLb0NKQ09xY05WP3VzcD1kcml2ZV9saW5r"
        }
      },
      "7": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVhaMjBXYWI0LXVLZm1La0NMbDUzbWV5UFB2WFhfUTBjP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUJjV0tGUDdCSmFoNDBHRmlud1U5OExmMjFKeVhBcU5zP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTI4d2d2NDdqZDM1M20zMUdUcS1xUGRBa050anNJNWJfP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU50S3FiR2RwMzZWSXV0dEJEMFBIU1NTU1JUQ1dHeEwyP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUgtTXFHN1JjVmwxc1ctMTJtYWcwQW40ak1fNHNSWE4xP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMURqbnZIa0RzSzFuMW1ISHdLODBGaEVfdnVORzh3UUxlP3VzcD1kcml2ZV9saW5r"
        },
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVhQYTA0cnh5SjR4U3hwbGF4ZmpFYnRxUWtXa3lsOE1iP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW1icnY3eV83VV9KY1AtcnZQU2RGUnNWdUZaOWFrQWNFP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXBrSnNsM3J0a2UzX0lIYnpQUVd6eDdsSWVzTTJjZWNXP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUV4Z2prbktVcUhvWkNpVXBicjY4WWg0OUFlcGEyS3AwP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXpLSzlRRTZGNy0ta3phNHp1bG1QMU5iQ1RLLVpTNE0zP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU5hTl9wbEtjUS05THdnVmlqRENXYzVGanQ3ZlA4Z0dMP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXR1cEdVTkpTZnFWalN3bVhCUU10S1pVQWpLUnFaemk4P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWxycWRxZ1l4cDR1a2xBWGVKLVp6Sk9xMnJYOGFFQnRMP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW5SN1ZHa1VkQUFjT2FSYkd5Ulg5SDNRYWwxdTBKbzRKP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU5naHNxZHFwckhETUdvNTN4Rjl3U19laDNlNElPM2JmP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUljdkRDRERJRmNzRGlveTlDT0ZZOXI2UHAwRlZkZjZYP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVJNVWNiMnNzUFgxN3pObElWSGxkWXZkNVFYcVdnbnlkP3VzcD1kcml2ZV9saW5r"
        },
        "ECE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXNLaGZrbDNsc2dlU05ZS3kwaUFtVUNDYUljNnRpUDFTP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTdNZ0M0eUpKY2k3WUtWaS1JalRKNFFUd2lrampfRHZPP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWxDaThLMTZpdnhidjNpMnZGSWwzbWpmMTdLN0dtUjJWP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTRMOTNxRnJKM3kxdy1CX01reGVxMFNjSjBUSldGU08zP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUV0VWVfTjdEaWJ1eVZ6QXZvYXFYS2FZTDVjYlI5UzVtP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXJ4ZV9MWWJhQndaMVdiNjNkMVFIZzdDZ3FvOVRUTVJXP3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXE3SnNQRmE2VDd2bV8zUGR2WkZTOU5lZmZlMi1RNHVvP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXVRVHV3Q3RmcGV6Sno4VjBkNXhqN3NCcGFJcDNxRFRKP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVpnVXpBVkQ4RVNWRWhMbkpvSHctTDNBS1pfVkRfWnh5P3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUk2LTFkYkt6TXJDN2lhQVJkQnNSRU5PcHNJdlhRVjhSP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXJjRTMzdFdGMFZWOXpldW5uY0NEdXVuVTZGQ0VHQW0yP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXdWZEdNTl9uX3ctdWZrZjZkcTR4bTlEOXg4MTdRakZMP3VzcD1kcml2ZV9saW5r"
        }
      },
      "8": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVBIeGtmeDltR0hXeHBjUXVGWDUxdkZGRk1NSEQ0YW9KP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWYwLThUSkhTRTQweTFYWmNCbks4VFhuZ1l4Nk5IT3pzP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTNMT196R1BYUklHaWNBOVpfazc3am9KZ3VFa0FJbjZsP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUR5V2ozV0ltMENNY2JMbFhlTUNOS2R4eDRmeWp6ZVlBP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW5JR2tuSzNLLV8ySFRMcDJRUEVsSkdHRU5lS2diMHROP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMURBbDFTT2FJdVVqbTlqM0piRXBOdDBUVzBoeXdZLWtmP3VzcD1kcml2ZV9saW5r"
        },
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW9KQ2V2TU8yQTAyaWwxQUZFVmdfRXJuSy1CRWtlUE9PP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWh2M19ucXY2cGhXY1BtQkZDTWZzOXhtRGl3Y1k1SmFpP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU9meDNLa1J1TUhjR0dPVjQ1WG44bURTUmliM1ZfZHdNP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUFka3pLSVZVVk9vYTNLNTY3akhmcTNzdlJRQ1k4TElEP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTZ2OUpxR1hnZ0c0TmNuSnlwdDRTYVJtOFpvYXJya0hDP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWk2b0M5X2xoNjZRWHBnbWFvYzRLa2NkVXRqTVBUclR6P3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVd1WUZsOEt2NHh3N0lYU2FlbkhYQkFnZFNKT0tGZ3lQP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTdlSTZlX2lpcklDSHdlemV1ZGhiY3lMWnRqalVqOHlNP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUhiUG9DX3M4cTkxOUJoZVVTaGsyZG1QZV83SmZWM2NqP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUp1X2djMzBTU2VrYlQ1THJGWFNadFFITUJteUl5RGp5P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUdYRUZGN2NkbDdRT2RmcXJldWtpZVNYanQ3NFpqRnl3P3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVBibTdmbWJEMTY3bE1KZDJGQjNfYzFXNmNTV2pnX3c1P3VzcD1kcml2ZV9saW5r"
        },
        "ECE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTVsbFlDdms5VWllNGlDWEE0TXZFV21QRmlaTTlUQXk4P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXlGSUsyNXlDQ1FFNm9ieTNFdjA5TGwzTHEzYzVUOGFQP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTlKR2lFSUY5Q2E0VzRtbS0xQ2xrNkt1cTFwWmdtbUpKP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUZ6T1l1UmpFZDAyaVBoMHpCaU14Rmo1a2NBT3g1WTIyP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXJMeG55dkt5cHZQaGk2UXUyTm1vR0NVcGNrQ3plRERzP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUpxV094R2lZYmY0cDVwcE9HUlMyT3gyZUtjaWhtdEVGP3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXNiYUxaenkwU3pyNXpFZjRMTG1GVDVDMTdTa0w1aEJtP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWc5VVRXNjhzOEhWQlNMckp6NGl3NEVZWkhYVEotQkxtP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVA0dmFPNWtNdWUwMmUwazJRTHFVMVZrb0JrNlRVdEM2P3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUUxNUk0YTIyTnVzcC1YUURhaTEyLS1qZGQ0M1h2eDhDP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTl3Y2VLdVlzTm5JSHJQV1ZoeFItWDVDdHNjMjZzcTU2P3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUdvWEwybEJWcEh0RWlkV0MyVC02MmJEZFgyQW80RjFXP3VzcD1kcml2ZV9saW5r"
        }
      }
    }
  },
  "polytechnic": {
    "semesters": 6,
    "branches": [
      "CIVIL",
      "ELECTRICAL",
      "MECHANICAL"
    ],
    "common": [
      1,
      2
    ],
    "data": {
      "1": {
        "common": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVNVa2VYUzdSNmpvMWY2MnRIdUpETHFBR3pGSW5RRXpNP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWlCY0EyNGEtUVk2ZXpLTzJ5Y0RKUExlWEsxVUEzQTc1P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUlaRzhCTW5OV0ZmRXNfVTRDN1BQeDZhVDd1bVhKUHRRP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWRGX1A3SHhXekVZNGhUNzBEZFBOaEt5ejc2cngxTHZmP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUJTSVJDMGtoQVEwb2RwZ3hNcnQyOXJlYXhTbmlQQ1VlP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUVkWlBvdGpZTnk5R0czc0U0Z1dyNk1xSmRrUDBGOXlzP3VzcD1kcml2ZV9saW5r"
        }
      },
      "2": {
        "common": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXV4NjRGZWM2VllpYnNjcTRtdzIyQ2xEalFYUHdpQklhP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVJLbVpMeFQ5NUFMa180SGJaWC0xcnNXb0VJZUZ4V2piP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZ1Q1Fyb09SQ0NVSy1Eci1VRnYzamhJMEVReHJpUDZlP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUdQdW5GOGRJRTAzZi1oeFZKa0VocWNEWXBNRVBGRGZVP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUJiU0tQc042LVRqRnRSQ3RBM25rUjFCaC04b3BLSHloP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTNwZW1RdUtvMWdpcDNEQXlmdjEzS21yWFh3emVHTnFBP3VzcD1kcml2ZV9saW5r"
        }
      },
      "3": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWN5RFBKdjBnd0tFU1Fqc3Y1MnJPQU02MGR1SVphM3U2P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTFSam5jX1FYQkhqSk1HVlUyUU9ncG1iREl4ZFl1UEFKP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMS1kOUoxMEhLTWhPSGJNcGM4aHpXMDJMemxKWGx3cm9iP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWdJRUNrbUlpS1ItdUZITTJ3SlVmTFNYdlZsVUpKWGY0P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWxyeXozbFpvLWxWU3ktNWhBZmpOaXk5QmdHRVpNMHFKP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVBXY3RkRlkzcUJ2cGNCTVhuTDlNYUotcDQxenZRd2NtP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTh0bFdHeThaSDdsTG1lV280TXp6Vm90NV90MEdhYTllP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXMtaGZTdXF3bU5CUWc3dVlUWmNDbGhyd05mOGY2eUJRP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVJ3SGZtMnJlLTYyZ2JDVGxlUFBnNTJlanpzQVhXbjExP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWZ5M18yZHJvdzhMZnd3YUFENDhnMG45VU5UTjN3S2ZnP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWwzVGpPeXFLYW13MV9YcTY0QmluX3dGcHdjQ09mUFRpP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMThwdHA0WjBmTEdFQjMxMUdRTHpBZEJEWVA3MG05YmpLP3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVp4eTF3bFNLV1hsdjZmcVIyZzF0VlJNX0VfLVBBRGJqP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXNVQmVIU3dqelZjMk9vU0tBU1FHSHhhV3VlVTRIRVdVP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMURPcExfY0x4bW81akJSbFFPdmhuV0dOV2dReEljVkZTP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXJCM2h1MURmcC1ZNDBqLWJySm80U0hSQW9OVU1TOFd4P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUZJMnV4NHgxTE9Lb0ZaV1NXZGhRanZZZDJ3U2l3bWdiP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTVocVNLSWtDQWRZMklJd1d5Sm9BdXlPZzdSZ3B3TVZTP3VzcD1kcml2ZV9saW5r"
        }
      },
      "4": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWRNcU56Q1ZRcGVvOU40RjZubGw1WnpBVGdRMURTdktoP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU14MVJfM0ltSkZLYXl1ZXZkT0lGN3JxU2N2NmNvaGk3P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVlFb1dtSTRfNWt0cHhwblhIREVpM2NEZTRnWG5pdEo3P3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWtmWXhHcXNuY0k2N0ZyeWtpcTQ5SDhncHJNUmZDamVKP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXZRbkR6SlFSbWJ5Wmx1b0FJTjl6cDAyYVk0MnJWUGRBP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWV3X3Q3NGlXQVhKaDFLQ1FTSnF0LTlYMmhYeVBZWFNGP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTBTd0x2WU5FV1RqbFVUcjFXaExISm5BNE5tZmJhd1BYP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVg4ODd4OHhUU0s2SVctRGpFN2ZVcVVFRGFhdEt2dG9QP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUJuWGY4SGpOdS03NXJ0RWdUem1TbjFOdWhOdmF2WUlOP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVFMSzdpV0VVczRZMnBkanZNRllBcURKWUpFcUJCeTRvP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVVDNEVteFMyUEpIbjhpckxGVU45Q3pRaV9HNkJ0T0o1P3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW40ZmVFWjlwUWlTSjVKZHZ0bGliSF9vci02cjlSc2JUP3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU1yUWRJdEdmak5uMXl5Y25jT2liLU0tR2IzcENVOVFUP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWJsWlV3ejdBM2RUMXFzam91cnE4c1g2QkVlM2JUT011P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXNodUdBTlNKWFRjT3NNdUVqUk9OaEdTcFB6TXRwYVRIP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMThWZmdYcGxESVp5My1ILUJuTk03d2R5UnpRTHNhMHFNP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMThRYlI5MW83TF9BV3VzRzV0Q0diMkY2cGZCSTRfYmVvP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTJwUWFuU044alV5b2xpZFdMM09uTlFrb1FRNkNMekRhP3VzcD1kcml2ZV9saW5r"
        }
      },
      "5": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWxGOHZhVzJpc2ZhWTVUdlJlNWJjMFNWNnhOUDdhZjZnP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTJUYTVGNE1mQnZibjBPN3dVVjVuU2ZqQTc5QWI2b19ZP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMS1pRFdCVDRHdGhrV3JFa1NNRTNJc2lqaTVEbURCc0NhP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTA5Y2ZvbGFlOUZrWTI1eVQ3T3VHZWhKVjdPNXB6OGNNP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU43aktHUENVTUdTODlsb3hVZW9EdGFMbzZEWEd6OWJVP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWtmWUs3ekczbWRxeThGdmlSMUhFSkM5LTZhZVdhcWlBP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUd4ZHhtanNwN200QTdwSDBKR25NV283aFBmZ2hzYU1vP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUd4RTNyVWVtWTFxVTFKa3hFdzhYLTBhUnMwMlIwOXJ1P3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZCcWdVdW1UNlVUekp2RW1VUlp3bXdaTEVhSElOTHRjP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXVWSXJ3TFZZZ1VHQ1ptLUQ5RDlJSzMzNjE1UVFzb21ZP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUxzVzdUR2ZzNUJpb210VjN6MjVvSFFiOTU2RjBuMkJUP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWtVajJYakNOSTVDSVFLX0V5NTBPd2daMlRhV0I3TVowP3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUVKcmxJaTFJaVpCbE5wbGJQTWltVVdCaWxqNVU3b3hiP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW5ZenFmY21IMmhuV1haWW1JOWVEWWxkN0cxWUNTazdIP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWZwdnRCYUd2OGxTQ0Ryc3N2eTRiT25JV0h2X2NZUzJKP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVgzWk5LTW83aVRxU3FyUWtOUzBIUU1KRnBOdGdIMlg1P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVVlSi1CYVl4RFU2Q01JTWtpUGU3T1p1ajJ4REJTeVloP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXBpczRGNEFBdDFHWThpVjlFZUtkekpnSFBURTc0aHNEP3VzcD1kcml2ZV9saW5r"
        }
      },
      "6": {
        "CIVIL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXd0MHNZUDFOcnctNzA3VXRfWXhRenpvM0lwZ1ZRT3ExP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXN4VlVBdWJFMVRMdkdsczlOaWxBSW50SmhySTJZN0JDP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTZ2UGpNcnl3S3FtbVlWRm9td0dYUEhVVzctWTdfY3JmP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWI2M3c5d0JxOERoOEVwVDRic2ZaMGE5VHBRU3dyVHN5P3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUJqZ1FvTHhlUUNTVTMzWXREVW1zRHVKVXdLWTRwdTVjP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXZQbDFUOGQ0bExmMWlaaXFrM2VHUVJkOFhHS012UU9CP3VzcD1kcml2ZV9saW5r"
        },
        "ELECTRICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVhWUUtrSVl4a0dmV2dUR24zR3ZzcVhlczVfZV9Sb0pvP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXJ1Z24ycUp5ZE5EaC1YN3l0dGNhampoN0hzSGp3RWljP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWd6dzdvYllRN0JKaFBxTl9uMUFNZHZkd1o2d08tTFFvP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXJpSGQ1TFMyTWMxNHlQbi10Qm5XN2xISUNRaWR4YkhBP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUFkOFhOcFJzallUMXFuQWF5cTBVLXE0WmpjeGRieTNiP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMThNczZKdWw4SzJWM0VCU0VzaDNRMkZrOFJ4NUc3MjJDP3VzcD1kcml2ZV9saW5r"
        },
        "MECHANICAL": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXdPMFgxYkU4Z1ZhMkQxMlk4YThwb3JkYy0wV0lsai1QP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXZPSkhkU0tDSllaVzdfYkFyZnlWM25PbFUzYjV6Uk5EP3VzcD1kcml2ZV9saW5r",
          "notes": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXBiN0dZWlpXN0NoZlQ4ckdYSzRQRlo2cTJhOE1hbFgtP3VzcD1kcml2ZV9saW5r",
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWZOc0NBLUMzQTJxalpBOENZVWxWOFVUOV9sUjl0QnFuP3VzcD1kcml2ZV9saW5r",
          "videos": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWtpUWZ2RTVJTE5kdkwwSERqbl93eHhza2pXVkt5em9uP3VzcD1kcml2ZV9saW5r",
          "papers": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXdMWjhBcVdNMmxCTW12YnpXR3BiWGdOX0MwLUttTmxPP3VzcD1kcml2ZV9saW5r"
        }
      }
    }
  },
  "mtech": {
    "semesters": 3,
    "branches": [
      "CSE",
      "CTM",
      "DCE",
      "PRODUCTION"
    ],
    "common": [],
    "data": {
      "1": {
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW9QdzZlTFNoeFU2LXoydXYyOUo1bnRzdVl6RUxOb2RJP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXRmb1E1N2hteGg2QTJZOV9YX0JVa3FMNVh2T0FHSm1tP3VzcD1kcml2ZV9saW5r"
        },
        "CTM": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTFCWTEyYUQ3SElHU0JIb3lTRnBnM3FYSmdUblNLTTkxP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXpETDNJMFVIM2FzS2JXR2d3NlJrcmNBX21BVHNDbGIwP3VzcD1kcml2ZV9saW5r"
        },
        "DCE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW1PY1pLM1ZXd3RyZ2tKRG1vd3hkLUVEQTUxR3I4eTJYP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU8zR2hwbkdSU0pqakJ3b1dTVk0wSi1LaXVVSnVrdWFYP3VzcD1kcml2ZV9saW5r"
        },
        "PRODUCTION": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVJDUXQ2WHh4MFRyRFNIYk01Z1Rud3FyLTZtUU5PcVVGP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXFrWXBGUTJFWTFsVEFPcnBmQlppUi1KZEdPMFJ6V21HP3VzcD1kcml2ZV9saW5r"
        }
      },
      "2": {
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTRNUlczdmFKRy1yYkRuVGRxZEZQQVVaSFZWMTFUVkdtP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXh6Qkg4UVhWUHpoak56VVdib25pdkZpaDNzZ3hxZTFpP3VzcD1kcml2ZV9saW5r"
        },
        "CTM": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVZjRXJicW9McDNfV1I4VE9BMzhrMVllT20zNk5OZnFBP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXpiMmEtaU5CTHh1NUZVNzM3czlWb0g5QVVIMzdDRjhTP3VzcD1kcml2ZV9saW5r"
        },
        "DCE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXk2c1VNQjZ4WjhOUVEtRUdkR3RmQXFhVEYxV2ZyYXM5P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMXBlVlNWT0VGTDJfcDVOdG1UQXRIZEhYeFpYV2JXdmU0P3VzcD1kcml2ZV9saW5r"
        },
        "PRODUCTION": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVFrcTBzS1VSZkNCSmdXcEtOeGdLemtQd2p1LUh3TUtXP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTBER3Q1RlY2cDRoY1NzTmVOOXRfVm1ydGFBak5sOTlWP3VzcD1kcml2ZV9saW5r"
        }
      },
      "3": {
        "CSE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMUdhbzJSUmdvTlVCY3NCUDZ2ak1ZWjlNYXB1ek4yNmpRP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVlMNG5jWi0zUnF2M0lqcjdyZDR4bEJ2MEJMRGI0c1BVP3VzcD1kcml2ZV9saW5r"
        },
        "CTM": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWVtcGF3c0NzczZocFcwaUFSWEdKZG1fVDExcHFhTDBzP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTNQLTY2ckI1SUoxbDdzTktyWGxhU3VfX2wwZWpVQ2FWP3VzcD1kcml2ZV9saW5r"
        },
        "DCE": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTlaU0h1akRiTThIQldGa1EwRmxCX0RaOU5keFdhMkNKP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWxBWmdLVktXQUNwNkI5QWlCRGQtRTh1cVFhcndxZmFZP3VzcD1kcml2ZV9saW5r"
        },
        "PRODUCTION": {
          "syllabus": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTU0TWtXY2NQMjdUY3RZMzdwN1hfdkI1XzNiVWlqQk8yP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU9GMllobjByeGlBaDBITFE2QXdMU0xDZ1RqSFQ0SnAwP3VzcD1kcml2ZV9saW5r"
        }
      }
    }
  },
  "mba": {
    "semesters": 4,
    "branches": [],
    "common": [
      1,
      2,
      3,
      4
    ],
    "data": {
      "1": {
        "common": {
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWJHNGItOGFYVDJ5YldKNjVnaUxxOGZBZkxqRFZxV250P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMTdMb21tT2NMT19vZVpLc2xUUjA0MEZrUVdKd1ZvQXhpP3VzcD1kcml2ZV9saW5r"
        }
      },
      "2": {
        "common": {
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW5QWldGQlluSHJySHpNYlEzdld1R1lZRGF2eXNkVF9EP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMURCeXJUYnNLZnBYWEF3ZnFNRlc4cnA3dVVTejBkSmM0P3VzcD1kcml2ZV9saW5r"
        }
      },
      "3": {
        "common": {
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMWljY0pLYzdxNERYX2VUeEl5ZnJCaGg2QUpvZFBDYUdkP3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMU9PQTNZYXhFd3c0V0NYVW5pZ1lid0tSYzdNUWh0T3VVP3VzcD1kcml2ZV9saW5r"
        }
      },
      "4": {
        "common": {
          "questions": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMVp5aTBpdHZEV2FMT2ZGMUVScUwzbkxlWGQtR3U0Qy01P3VzcD1kcml2ZV9saW5r",
          "books": "aHR0cHM6Ly9kcml2ZS5nb29nbGUuY29tL2RyaXZlL2ZvbGRlcnMvMW1KMGsyLWcyYzg1OFR0Slh4X2lBUUFtdXItdmk3dXJrP3VzcD1kcml2ZV9saW5r"
        }
      }
    }
  }
};
