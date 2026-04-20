package com.smartcampus.backend.model;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class Role {
    private String name;

    public Role() {}
    public Role(String name) { this.name = name; }

}
